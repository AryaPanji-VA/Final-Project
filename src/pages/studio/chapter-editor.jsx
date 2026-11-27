import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Bold, Italic, LoaderCircle, Quote, Minus } from "lucide-react";

import { chapterService, storyService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Overline } from "@/components/ui/card";

/**
 * ChapterEditorPage — the writing surface (§9.5).
 *
 * A 760px serif textarea with a minimal markdown-lite toolbar. The toolbar
 * wraps the current selection; nothing is lost on submit. Word count is
 * derived live from the text, not stored.
 */
export function ChapterEditorPage() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    let active = true;

    Promise.all([storyService.get(storyId), chapterService.get(chapterId)])
      .then(([storyData, chapterData]) => {
        if (!active) return;
        if (!storyData) throw new Error("That story could not be found.");
        if (!chapterData || chapterData.storyId !== storyData.id) {
          throw new Error("That chapter could not be found.");
        }

        setStory(storyData);
        setChapter(chapterData);
        setTitle(chapterData.title);
        setStatus(chapterData.status);
        setContent(chapterData.content);
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [storyId, chapterId]);

  const words = content.split(/\s+/).filter(Boolean).length;

  function wrap(marker) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart: start, selectionEnd: end } = textarea;
    const selected = content.slice(start, end) || "text";
    const next = content.slice(0, start) + marker + selected + marker + content.slice(end);

    setContent(next);
    setIsDirty(true);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  }

  function prefixLine(prefix) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);

    setContent(next);
    setIsDirty(true);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  async function save() {
    setIsSaving(true);
    setServerError(null);

    try {
      const updated = await chapterService.update(chapterId, { title, status, content });
      setChapter(updated);
      setSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      setServerError(error.message ?? "The chapter could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAndPublish() {
    setStatus("published");
    setIsSaving(true);
    setServerError(null);

    try {
      const updated = await chapterService.update(chapterId, {
        title,
        status: "published",
        content,
      });
      setChapter(updated);
      setSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      setServerError(error.message ?? "The chapter could not be published.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loadError) {
    return (
      <ErrorState
        title="Chapter unavailable"
        message={loadError}
        onRetry={() => navigate(`/studio/writing/${storyId}`)}
        retryLabel="Back to the story"
      />
    );
  }

  if (isLoading) {
    return <LoadingState variant="prose" label="Loading chapter…" />;
  }

  return (
    <>
      <PageHeader
        overline={`Create / Writing / Chapter ${String(chapter.index).padStart(2, "0")}`}
        title={story.title}
        backTo={`/studio/writing/${storyId}`}
        backLabel="Story settings"
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link to={`/studio/writing/${storyId}`}>Close</Link>
            </Button>

            <Button variant="outline" onClick={save} disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Draft"
              )}
            </Button>

            <Button onClick={saveAndPublish} disabled={isSaving}>
              Publish Chapter
            </Button>
          </>
        }
      />

      <div className="max-w-[760px]">
        <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
          <Field label="Chapter title" htmlFor="chapterTitle">
            <Input
              id="chapterTitle"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setIsDirty(true);
              }}
              className="h-11 font-reading text-[17px]"
              placeholder="Chapter title"
            />
          </Field>

          <Field label="Status" htmlFor="chapterStatus">
            <Select
              id="chapterStatus"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setIsDirty(true);
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
        </div>

        {/* Writing surface */}
        <div className="mt-6 border border-border bg-surface">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <button
              type="button"
              onClick={() => wrap("**")}
              title="Bold"
              aria-label="Bold"
              className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
            >
              <Bold className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => wrap("_")}
              title="Italic"
              aria-label="Italic"
              className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
            >
              <Italic className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => prefixLine("> ")}
              title="Block quote"
              aria-label="Block quote"
              className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
            >
              <Quote className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => prefixLine("— ")}
              title="Scene break"
              aria-label="Scene break"
              className="flex size-11 items-center justify-center rounded-[2px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-8"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>

            <span className="type-num ml-auto pr-1 text-ink-faint">
              {words.toLocaleString("en-GB")} words
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setIsDirty(true);
            }}
            placeholder="Begin the chapter. Blank lines separate paragraphs; the reader sets the first letter as a drop cap."
            aria-label="Chapter text"
            className="min-h-[440px] w-full resize-y bg-transparent px-5 py-5 font-reading text-[18.5px] leading-[1.78] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>

        {serverError ? (
          <p
            role="alert"
            className="mt-5 border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert"
          >
            {serverError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ink-faint" aria-live="polite">
            {savedAt
              ? `Saved at ${savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : isDirty
                ? "Unsaved changes — not saved yet"
                : "No changes since last save"}
          </p>

          <div className="flex items-center gap-3">
            <Overline className="hidden sm:block">Markdown-lite</Overline>
            <Button variant="ghost" asChild>
              <Link to={`/studio/writing/${storyId}`}>Done</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
