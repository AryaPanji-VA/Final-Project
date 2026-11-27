import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { z } from "zod";

import { chapterService, storyService, universeService } from "@/services/mock-api";
import { formatRelativeDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
import { Overline } from "@/components/ui/card";

const GENRES = [
  "Literary Fantasy",
  "Science Fiction",
  "Urban Fantasy",
  "Historical",
  "Horror",
  "Mythic",
  "Other",
];

const storySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(90, "Title is too long"),
  genre: z.string().min(1, "Choose a genre"),
  synopsis: z
    .string()
    .min(30, "Write a synopsis of at least 30 characters")
    .max(400, "Synopsis must be 400 characters or fewer"),
  universeId: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export function StoryEditorPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const isNew = !storyId;

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: "",
      genre: "",
      synopsis: "",
      universeId: "",
      status: "draft",
    },
    mode: "onBlur",
  });

  const synopsis = useWatch({ control, name: "synopsis" }) ?? "";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [storyData, universeData] = await Promise.all([
          isNew ? Promise.resolve(null) : storyService.get(storyId),
          universeService.list(),
        ]);

        if (!active) return;

        setUniverses(universeData);

        if (isNew) {
          setChapters([]);
          return;
        }

        if (!storyData) throw new Error("That story could not be found.");

        setStory(storyData);
        setChapters(storyData.chapters);
        reset({
          title: storyData.title,
          genre: storyData.genre,
          synopsis: storyData.synopsis,
          universeId: storyData.universeId ?? "",
          status: storyData.status,
        });
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
  }, [storyId, isNew, reset]);

  async function onSubmit(values) {
    setServerError(null);

    try {
      const payload = {
        ...values,
        universeId: values.universeId || null,
        // Keep the original publication date if there is one; otherwise stamp
        // today, so a newly published story sorts correctly in "recent".
        publishedAt:
          values.status === "published"
            ? (story?.publishedAt ?? new Date().toISOString().slice(0, 10))
            : null,
      };

      if (isNew) {
        const created = await storyService.create(payload);
        navigate(`/studio/writing/${created.id}`, { replace: true });
      } else {
        await storyService.update(storyId, payload);
        setSavedAt(new Date());
      }
    } catch (error) {
      setServerError(error.message ?? "The story could not be saved.");
    }
  }

  async function addChapter() {
    if (!storyId) return;
    const chapter = await chapterService.create(storyId, { title: "Untitled chapter" });
    navigate(`/studio/writing/${storyId}/chapter/${chapter.id}`);
  }

  if (loadError) {
    return (
      <ErrorState
        title="Story unavailable"
        message={loadError}
        onRetry={() => navigate("/studio/writing")}
        retryLabel="Back to Writing Studio"
      />
    );
  }

  if (isLoading) {
    return <LoadingState variant="prose" label="Loading story…" />;
  }

  return (
    <>
      <PageHeader
        overline="Create / Writing"
        title={isNew ? "New Story" : story.title}
        description={
          isNew
            ? "A title, a genre, and a synopsis. Chapters come next."
            : "Story metadata and the chapter list. Publish when the first chapter is ready."
        }
        backTo="/studio/writing"
        backLabel="Writing Studio"
        actions={
          story?.status === "published" ? (
            <Button asChild variant="outline">
              <Link to={`/stories/${story.slug}`}>View public page</Link>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-14">
        {/* Metadata form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[620px]">
          <div className="space-y-5">
            <Field label="Title" htmlFor="title" error={errors.title?.message}>
              <Input
                id="title"
                placeholder="e.g. The Last Ember"
                className="h-11 font-reading text-[18px]"
                invalid={Boolean(errors.title)}
                {...register("title")}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Genre" htmlFor="genre" error={errors.genre?.message}>
                <Select id="genre" invalid={Boolean(errors.genre)} {...register("genre")}>
                  <option value="">Choose a genre…</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Status" htmlFor="status" error={errors.status?.message}>
                <Select id="status" {...register("status")}>
                  <option value="draft">Draft — private</option>
                  <option value="published">Published — visible in Discover</option>
                </Select>
              </Field>
            </div>

            <Field
              label="Universe"
              htmlFor="universeId"
              error={errors.universeId?.message}
              hint="Optional. Links this story to a world archive."
              optional
            >
              <Select id="universeId" {...register("universeId")}>
                <option value="">No universe</option>
                {universes.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Synopsis"
              htmlFor="synopsis"
              error={errors.synopsis?.message}
              hint={`${synopsis.length}/400 characters`}
            >
              <Textarea
                id="synopsis"
                rows={5}
                maxLength={400}
                placeholder="What happens, and why should someone read it?"
                invalid={Boolean(errors.synopsis)}
                {...register("synopsis")}
              />
            </Field>
          </div>

          {serverError ? (
            <p role="alert" className="mt-5 border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert">
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
              <Button variant="ghost" asChild>
                <Link to="/studio/writing">Cancel</Link>
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : isNew ? (
                  "Create Story"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Chapter list */}
        <aside>
          <Overline className="border-b border-border pb-2">Chapters</Overline>

          {isNew ? (
            <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
              Create the story first, then add chapters.
            </p>
          ) : (
            <>
              <ul className="mt-2 divide-y divide-border">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      to={`/studio/writing/${storyId}/chapter/${chapter.id}`}
                      className="group flex items-baseline gap-3 py-3"
                    >
                      <span className="type-num w-5 shrink-0 text-ink-faint">
                        {String(chapter.index).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-ui text-[14px] font-medium text-ink group-hover:text-arcane-bright">
                          {chapter.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-faint">
                          {chapter.words.toLocaleString("en-GB")} words ·{" "}
                          {formatRelativeDate(chapter.updatedAt)}
                        </span>
                      </span>
                      <StatusBadge status={chapter.status} />
                    </Link>
                  </li>
                ))}
              </ul>

              {chapters.length === 0 ? (
                <p className="mt-3 text-[13px] text-ink-muted">
                  No chapters yet. Add the first one below.
                </p>
              ) : null}

              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={addChapter}>
                <Plus className="size-4" aria-hidden="true" />
                Add Chapter
              </Button>
            </>
          )}

          <div className="mt-8 border-t border-border pt-4">
            <Overline>Scope</Overline>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
              Stories, chapters and metadata are saved in this browser. Publishing here changes the
              public pages in this browser, not a server.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
