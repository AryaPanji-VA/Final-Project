import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bold, Italic, LoaderCircle, Plus, X } from "lucide-react";

import { loreService, universeService } from "@/services/mock-api";
import { CANON_STATUSES, LORE_CATEGORIES, MAX_TAGS, loreSchema } from "@/schemas/lore-schema";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Overline } from "@/components/ui/card";

/**
 * LoreEditorPage — write one encyclopedia entry (§9.7).
 *
 * A single 720px column: title, category + canon, summary, then a long-form
 * body with a markdown-lite toolbar and a tag chip field. The footer carries
 * the save state, because that is the thing a writer checks.
 */
export function LoreEditorPage() {
  const { universeId, loreId } = useParams();
  const navigate = useNavigate();

  const isNew = !loreId;

  const [universe, setUniverse] = useState(null);
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState("");

  const bodyRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(loreSchema),
    defaultValues: { title: "", category: "Character", canon: "draft", summary: "", content: "" },
    mode: "onBlur",
  });

  const content = useWatch({ control, name: "content" }) ?? "";
  const summary = useWatch({ control, name: "summary" }) ?? "";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [universeData, entryData] = await Promise.all([
          universeService.get(universeId),
          isNew ? Promise.resolve(null) : loreService.get(loreId),
        ]);

        if (!active) return;
        if (!universeData) throw new Error("That universe could not be found.");
        if (!isNew && !entryData) throw new Error("That entry could not be found.");

        setUniverse(universeData);

        if (entryData) {
          setEntry(entryData);
          setTags(entryData.tags ?? []);
          reset({
            title: entryData.title,
            category: entryData.category,
            canon: entryData.canon,
            summary: entryData.summary,
            content: entryData.content,
          });
        }
      } catch (requestError) {
        if (active) setLoadError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [universeId, loreId, isNew, reset]);

  function wrap(marker) {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const { selectionStart: start, selectionEnd: end } = textarea;
    const selected = content.slice(start, end) || "text";
    const next = `${content.slice(0, start)}${marker}${selected}${marker}${content.slice(end)}`;

    setValue("content", next, { shouldDirty: true });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  }

  function addTag() {
    const value = tagDraft.trim().toLowerCase().replace(/^#/, "");
    if (!value || tags.includes(value) || tags.length >= MAX_TAGS) return;
    setTags((current) => [...current, value]);
    setTagDraft("");
  }

  function removeTag(tag) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  async function onSubmit(values) {
    setServerError(null);

    try {
      if (isNew) {
        const created = await loreService.create(universeId, { ...values, tags });
        navigate(`/studio/worlds/${universeId}/lore/${created.id}`, { replace: true });
      } else {
        await loreService.update(loreId, { ...values, tags });
        setSavedAt(new Date());
      }
    } catch (error) {
      setServerError(error.message ?? "The entry could not be saved.");
    }
  }

  if (loadError) {
    return (
      <ErrorState
        title="Entry unavailable"
        message={loadError}
        onRetry={() => navigate(`/studio/worlds/${universeId}/lore`)}
        retryLabel="Back to the encyclopedia"
      />
    );
  }

  if (isLoading) {
    return <LoadingState variant="prose" label="Loading entry…" />;
  }

  return (
    <>
      <PageHeader
        overline={`Create / Worldbuilding / ${universe?.name ?? "Universe"} / Encyclopedia`}
        title={isNew ? "New entry" : entry.title}
        description={
          isNew
            ? "One entry, one subject. Write the summary first — it is what the index shows."
            : "Edit the entry. Canon status decides whether the index treats it as established."
        }
        backTo={`/studio/worlds/${universeId}/lore`}
        backLabel="Encyclopedia"
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[760px]">
        <div className="space-y-5">
          <Field label="Title" htmlFor="loreTitle" error={errors.title?.message}>
            <Input
              id="loreTitle"
              placeholder="e.g. The Cloud Sea"
              className="h-11 font-reading text-[17px]"
              invalid={Boolean(errors.title)}
              {...register("title")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="loreCategory" error={errors.category?.message}>
              <Select id="loreCategory" invalid={Boolean(errors.category)} {...register("category")}>
                {LORE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Canon status" htmlFor="loreCanon" error={errors.canon?.message}>
              <Select id="loreCanon" invalid={Boolean(errors.canon)} {...register("canon")}>
                {CANON_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Summary"
            htmlFor="loreSummary"
            error={errors.summary?.message}
            hint={`${summary.length}/240 characters — shown in the index`}
          >
            <Textarea
              id="loreSummary"
              rows={2}
              maxLength={240}
              placeholder="Two sentences that place this entry in the world."
              invalid={Boolean(errors.summary)}
              {...register("summary")}
            />
          </Field>

          {/* The body needs its own label + toolbar, so it is not a Field:
              Field clones the id onto a single child, and this child is a
              wrapper containing both the toolbar and the textarea. */}
          <div className="flex flex-col">
            <label
              htmlFor="loreContent"
              className="mb-1.5 text-[12.5px] font-medium text-ink"
            >
              Entry
            </label>

            <div className="border border-control bg-surface">
              <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => wrap("**")}
                  aria-label="Bold"
                  title="Bold"
                  className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
                >
                  <Bold className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => wrap("_")}
                  aria-label="Italic"
                  title="Italic"
                  className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
                >
                  <Italic className="size-4" aria-hidden="true" />
                </button>

                <span className="type-num ml-auto pr-1 text-ink-faint">
                  {content.split(/\s+/).filter(Boolean).length.toLocaleString("en-GB")} words
                </span>
              </div>

              <textarea
                id="loreContent"
                ref={bodyRef}
                rows={12}
                placeholder="Write the entry. Blank lines separate paragraphs."
                aria-invalid={Boolean(errors.content) || undefined}
                aria-describedby={errors.content ? "loreContent-message" : undefined}
                className="min-h-[300px] w-full resize-y bg-transparent px-3 py-3 font-reading text-[17px] leading-[1.75] text-ink placeholder:text-ink-faint focus:outline-none"
                {...register("content")}
              />
            </div>

            {errors.content ? (
              <p id="loreContent-message" role="alert" className="mt-1 text-[12px] text-alert">
                {errors.content.message}
              </p>
            ) : null}
          </div>

          {/* Tags */}
          <div>
            <p className="mb-1.5 text-[12.5px] font-medium text-ink">
              Tags
              <span className="ml-2 text-[11px] font-normal text-ink-faint">
                {tags.length}/{MAX_TAGS}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <Input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="sailcraft, tides…"
                aria-label="Add a tag"
                disabled={tags.length >= MAX_TAGS}
                className="max-w-[280px]"
              />

              <Button
                variant="quiet"
                size="sm"
                onClick={addTag}
                disabled={!tagDraft.trim() || tags.length >= MAX_TAGS}
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add
              </Button>
            </div>

            {tags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex h-7 items-center gap-1 border border-border-strong bg-paper-muted pl-2 pr-1 text-[11.5px] text-ink-muted"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="flex size-5 items-center justify-center text-ink-faint transition-colors hover:text-alert"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {serverError ? (
          <p
            role="alert"
            className="mt-5 border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert"
          >
            {serverError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ink-faint" aria-live="polite">
            {savedAt
              ? `Saved at ${savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : isDirty
                ? "Unsaved changes — not saved yet"
                : isNew
                  ? "Nothing written yet"
                  : "No changes"}
          </p>

          <div className="flex items-center gap-3">
            <Overline className="hidden sm:block">Markdown-lite</Overline>

            <Button variant="ghost" asChild>
              <Link to={`/studio/worlds/${universeId}/lore`}>Cancel</Link>
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : isNew ? (
                "Create Entry"
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
