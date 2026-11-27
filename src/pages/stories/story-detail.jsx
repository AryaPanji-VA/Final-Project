import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Bookmark, BookmarkCheck, BookOpen, Heart, Play } from "lucide-react";

import { libraryService, storyService } from "@/services/mock-api";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { StoryCover } from "@/components/shared/story-cover";
import { StoryCard } from "@/components/shared/story-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { GenreTag, StatusBadge } from "@/components/ui/badge";

export function StoryDetailPage() {
  const { slug } = useParams();

  const [story, setStory] = useState(null);
  const [moreByAuthor, setMoreByAuthor] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let active = true;

    storyService
      .get(slug)
      .then(async (data) => {
        if (!active) return;
        if (!data) throw new Error("This story is not in the archive.");

        // Bookmarks are keyed by story id, not slug — resolve the story first.
        const [bookmarked, siblings] = await Promise.all([
          libraryService.isBookmarked(data.id),
          data.authorId ? storyService.listByAuthor(data.authorId) : Promise.resolve([]),
        ]);

        if (!active) return;
        setStory(data);
        setIsBookmarked(bookmarked);
        setMoreByAuthor(
          siblings.filter((item) => item.id !== data.id && item.status === "published").slice(0, 4),
        );
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
  }, [slug]);

  async function toggleBookmark() {
    if (!story) return;
    const next = await libraryService.toggleBookmark(story.id);
    setIsBookmarked(next);
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState variant="prose" label="Loading story…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorState
          title="Story unavailable"
          message={error}
          onRetry={() => window.location.assign("/stories")}
          retryLabel="Back to the catalogue"
        />
      </div>
    );
  }

  const firstChapter = story.chapters.find((chapter) => chapter.status === "published");
  const readHref = firstChapter
    ? `/stories/${story.slug}/read/${firstChapter.id}`
    : `/stories/${story.slug}`;

  return (
    <article className="pb-16">
      {/* Masthead: cover plate on the left, editorial detail on the right.
          The wash ties this page to the public editorial headers. */}
      <header className="ink-wash border-b border-border py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
          <div className="mx-auto w-full max-w-[240px] lg:mx-0 lg:max-w-none">
            <StoryCover story={story} size="lg" className="shadow-[0_24px_50px_-30px_rgba(0,0,0,0.65)]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <GenreTag>{story.genre}</GenreTag>
              <StatusBadge status={story.status} />
              {story.universe ? (
                <Link
                  to={`/universes/${story.universe.id}`}
                  className="label-box border-border-strong text-ink-muted transition-colors hover:border-ink hover:text-ink"
                >
                  {story.universe.name}
                </Link>
              ) : null}
            </div>

            <h1 className="mt-4 font-serif text-[clamp(2rem,1.4rem+2.8vw,3.25rem)] leading-[1.04] tracking-[-0.03em] text-ink">
              {story.title}
            </h1>

            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-ink-muted sm:text-[16px]">
              {story.synopsis}
            </p>

            <p className="mt-5 text-[13px] text-ink-muted">
              by{" "}
              <Link
                to={`/creators/${story.author?.handle}`}
                className="font-medium text-ink underline-offset-4 hover:text-arcane-bright hover:underline"
              >
                {story.author?.name}
              </Link>
              <span aria-hidden="true" className="mx-2 text-ink-faint">
                ·
              </span>
              {story.chapterCount} chapters
              <span aria-hidden="true" className="mx-2 text-ink-faint">
                ·
              </span>
              {story.wordCount.toLocaleString("en-GB")} words
              <span aria-hidden="true" className="mx-2 text-ink-faint">
                ·
              </span>
              updated {formatRelativeDate(story.updatedAt)}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {firstChapter ? (
                <Button asChild size="lg">
                  <Link to={readHref}>
                    <Play className="size-4" aria-hidden="true" />
                    Start reading
                  </Link>
                </Button>
              ) : (
                <Button size="lg" disabled>
                  No chapters published yet
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={toggleBookmark}
                aria-pressed={isBookmarked}
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
              </Button>

              <button
                type="button"
                onClick={() => setLiked((value) => !value)}
                aria-pressed={liked}
                aria-label={liked ? "Unlike story" : "Like story"}
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-[3px] border px-4 text-[15px] transition-colors",
                  liked
                    ? "border-alert bg-alert/8 text-alert"
                    : "border-border-strong text-ink-muted hover:border-ink hover:text-ink",
                )}
              >
                <Heart className={cn("size-4", liked && "fill-current")} aria-hidden="true" />
                {(story.likes + (liked ? 1 : 0)).toLocaleString("en-GB")}
              </button>
            </div>

            <dl className="mt-8 grid max-w-[520px] grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-5 text-[12px] sm:grid-cols-4">
              {[
                ["Published", story.publishedAt ? formatDate(story.publishedAt) : "—"],
                ["Reads", story.reads.toLocaleString("en-GB")],
                ["Words", story.wordCount.toLocaleString("en-GB")],
                ["Chapters", `${story.chapterCount} / ${story.totalChapters}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="overline text-ink-faint">{label}</dt>
                  <dd className="mt-1.5 font-mono text-[12.5px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-[1fr_280px] lg:gap-16">
        {/* Chapter list */}
        <section aria-labelledby="chapters-heading">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <h2 id="chapters-heading" className="font-serif text-[22px] text-ink">
              Chapters
            </h2>
            <span className="overline text-ink-faint">
              {story.totalChapters} total
            </span>
          </div>

          {story.chapters.length === 0 ? (
            <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
              This story has no chapters yet.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {story.chapters.map((chapter) => {
                const published = chapter.status === "published";

                return (
                  <li key={chapter.id}>
                    {published ? (
                      <Link
                        to={`/stories/${story.slug}/read/${chapter.id}`}
                        className="group flex items-baseline gap-4 py-4 transition-colors hover:bg-paper-muted/40"
                      >
                        <span className="w-7 shrink-0 font-mono text-[12px] text-ink-faint">
                          {String(chapter.index).padStart(2, "0")}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-[16.5px] leading-snug text-ink group-hover:text-arcane-bright">
                            {chapter.title}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                            {chapter.words.toLocaleString("en-GB")} words
                            <span aria-hidden="true" className="mx-1.5">
                              ·
                            </span>
                            {formatRelativeDate(chapter.updatedAt)}
                          </span>
                        </span>

                        <BookOpen
                          className="size-4 shrink-0 self-center text-ink-faint transition-colors group-hover:text-arcane-bright"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <div className="flex items-baseline gap-4 py-4 opacity-60">
                        <span className="w-7 shrink-0 font-mono text-[12px] text-ink-faint">
                          {String(chapter.index).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-[16.5px] leading-snug text-ink-muted">
                            {chapter.title}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                            Not published yet
                          </span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Sidebar: author + universe + tags */}
        <aside className="space-y-8">
          <div className="border-t border-border pt-4">
            <p className="overline text-ink-faint">Author</p>
            <Link
              to={`/creators/${story.author?.handle}`}
              className="mt-2 block font-serif text-[17px] text-ink hover:text-arcane-bright"
            >
              {story.author?.name}
            </Link>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {story.author?.bio}
            </p>
            <p className="mt-2 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">
              {story.author?.followers.toLocaleString("en-GB")} followers
            </p>
          </div>

          {story.universe ? (
            <div className="border-t border-border pt-4">
              <p className="overline text-ink-faint">Set in</p>
              <Link
                to={`/universes/${story.universe.id}`}
                className="mt-2 block font-serif text-[17px] text-ink hover:text-arcane-bright"
              >
                {story.universe.name}
              </Link>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                {story.universe.description}
              </p>
            </div>
          ) : null}

          {story.tags.length > 0 ? (
            <div className="border-t border-border pt-4">
              <p className="overline text-ink-faint">Tags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/stories?tag=${tag}`}
                    className="inline-flex h-6 items-center border border-border-strong px-2 text-[11px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* More by the author */}
      {moreByAuthor.length > 0 ? (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-serif text-[22px] text-ink">
            More by {story.author.name}
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {moreByAuthor.map((item) => (
              <StoryCard key={item.id} story={item} size="sm" />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
