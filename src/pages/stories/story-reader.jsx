import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, List } from "lucide-react";

import { chapterService, libraryService, storyService } from "@/services/mock-api";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

/**
 * StoryReaderPage — the immersive reading experience (§9.4).
 *
 * Rendered inside ImmersiveLayout: no site nav, a 760px column, optional
 * Archive Dark. Reading progress is measured against the article element and
 * written back to the library so "continue reading" works.
 */
export function StoryReaderPage() {
  const { slug, chapterId } = useParams();

  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isContentsOpen, setIsContentsOpen] = useState(false);

  const articleRef = useRef(null);

  useEffect(() => {
    let active = true;

    Promise.all([storyService.get(slug), chapterService.get(chapterId)])
      .then(([storyData, chapterData]) => {
        if (!active) return;
        if (!storyData) throw new Error("This story is not in the archive.");
        if (!chapterData || chapterData.storyId !== storyData.id) {
          throw new Error("That chapter could not be found.");
        }

        setStory(storyData);
        setChapter(chapterData);
        setIsContentsOpen(false);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, chapterId]);

  // Bookmark state is per story, not per chapter.
  useEffect(() => {
    if (!story) return;
    let active = true;
    libraryService.isBookmarked(story.id).then((value) => {
      if (active) setIsBookmarked(value);
    });
    return () => {
      active = false;
    };
  }, [story]);

  // Scroll to top on chapter change — the reader always starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [chapterId]);

  // Track reading progress and persist it (throttled to whole percents).
  useEffect(() => {
    if (!story || !chapter) return undefined;

    function onScroll() {
      const article = articleRef.current;
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const scrolled = Math.min(Math.max(-rect.top + 120, 0), Math.max(total, 1));
      const percent = Math.round((scrolled / Math.max(total, 1)) * 100);

      setProgress(percent);

      if (percent % 10 === 0) {
        libraryService.setProgress(story.id, chapter.id, percent);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [story, chapter]);

  async function toggleBookmark() {
    if (!story) return;
    const next = await libraryService.toggleBookmark(story.id);
    setIsBookmarked(next);
  }

  if (isLoading) {
    return (
      <div className="pt-8">
        <LoadingState variant="prose" label="Loading chapter…" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Chapter unavailable"
        message={error}
        onRetry={() => window.location.assign("/stories")}
        retryLabel="Back to the catalogue"
      />
    );
  }

  const published = story.chapters.filter((item) => item.status === "published");
  const index = published.findIndex((item) => item.id === chapter.id);
  const previous = index > 0 ? published[index - 1] : null;
  const next = index >= 0 && index < published.length - 1 ? published[index + 1] : null;

  return (
    <>
      {/* Progress rule pinned under the chrome. */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-transparent"
        style={{ background: "transparent" }}
      >
        <div
          className="h-px bg-arcane-bright transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article ref={articleRef}>
        <header className="border-b border-border pb-8">
          <Link
            to={`/stories/${story.slug}`}
            className="overline text-ink-faint transition-colors hover:text-ink"
          >
            {story.title}
          </Link>

          <p className="type-meta mt-4 text-ink-faint">
            Chapter {String(chapter.index).padStart(2, "0")} of{" "}
            {String(published.length).padStart(2, "0")}
          </p>

          <h1 className="type-page mt-2 text-[clamp(1.9rem,1.4rem+1.9vw,2.7rem)] text-ink">
            {chapter.title}
          </h1>

          <p className="mt-3 text-[13px] text-ink-muted">
            {story.author?.name}
            <span aria-hidden="true" className="mx-2 text-ink-faint">
              ·
            </span>
            {chapter.words.toLocaleString("en-GB")} words
            <span aria-hidden="true" className="mx-2 text-ink-faint">
              ·
            </span>
            {progress}% read
          </p>
        </header>

        {/* `.reading` carries the measure, the drop cap and the type scale
            (var(--reader-scale), set by the immersive layout's size control). */}
        <div className="reading mt-10">
          {chapter.content.split("\n\n").map((paragraph, position) => (
            <p key={position}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={toggleBookmark}
            aria-pressed={isBookmarked}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-[3px] border px-3 text-[13px] transition-colors",
              isBookmarked
                ? "border-arcane-bright bg-arcane/40 text-arcane-bright"
                : "border-border-strong text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="size-4" aria-hidden="true" />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="size-4" aria-hidden="true" />
                Bookmark
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsContentsOpen((value) => !value)}
            aria-expanded={isContentsOpen}
            className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-border-strong px-3 text-[13px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
          >
            <List className="size-4" aria-hidden="true" />
            Contents
          </button>
        </div>

        {isContentsOpen ? (
          <nav aria-label="Chapters" className="mt-4 border border-border p-2">
            {published.map((item) => (
              <Link
                key={item.id}
                to={`/stories/${story.slug}/read/${item.id}`}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[2px] px-2 text-[13.5px] transition-colors",
                  item.id === chapter.id
                    ? "bg-paper-muted text-ink"
                    : "text-ink-muted hover:bg-paper-muted/60 hover:text-ink",
                )}
              >
                <span className="type-num w-6 shrink-0 text-ink-faint">
                  {String(item.index).padStart(2, "0")}
                </span>
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
          </nav>
        ) : null}

        {/* Chapter navigation */}
        <nav aria-label="Chapter navigation" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link
              to={`/stories/${story.slug}/read/${previous.id}`}
              className="group flex items-center gap-3 border border-border p-4 transition-colors hover:border-ink"
            >
              <ArrowLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
              <span className="min-w-0">
                <span className="overline block text-ink-faint">Previous</span>
                <span className="type-section mt-1 block truncate text-[16px] text-ink group-hover:text-arcane-bright">
                  {previous.title}
                </span>
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          {next ? (
            <Link
              to={`/stories/${story.slug}/read/${next.id}`}
              className="group flex items-center justify-end gap-3 border border-border p-4 text-right transition-colors hover:border-ink"
            >
              <span className="min-w-0">
                <span className="overline block text-ink-faint">Next</span>
                <span className="type-section mt-1 block truncate text-[16px] text-ink group-hover:text-arcane-bright">
                  {next.title}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          ) : (
            <div className="flex items-center justify-end border border-border p-4 text-right">
              <div>
                <p className="overline text-ink-faint">End of published chapters</p>
                <Button asChild variant="ghost" size="sm" className="mt-1.5">
                  <Link to={`/stories/${story.slug}`}>Back to story</Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      </article>
    </>
  );
}
