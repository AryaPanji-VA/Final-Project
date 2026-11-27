import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bookmark, BookmarkX } from "lucide-react";

import { libraryService } from "@/services/mock-api";
import { formatRelativeDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StoryRow } from "@/components/shared/story-card";
import { CreatorCard } from "@/components/shared/creator-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHead } from "@/components/shared/section-head";
import { Button } from "@/components/ui/button";

export function LibraryPage() {
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    const data = await libraryService.get();
    setLibrary(data);
  }

  useEffect(() => {
    let active = true;

    libraryService
      .get()
      .then((data) => {
        if (active) setLibrary(data);
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
  }, []);

  async function removeBookmark(storyId) {
    await libraryService.toggleBookmark(storyId);
    await load();
  }

  if (error) {
    return (
      <>
        <PageHeader overline="Read" title="My Library" />
        <ErrorState title="Your library could not be loaded" message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Read"
        title="My Library"
        description="What you are reading, what you have saved, and the creators you follow."
      />

      {isLoading ? (
        <LoadingState variant="rows" count={3} label="Loading your library…" />
      ) : (
        <>
          {/* Continue reading — the primary section. */}
          <section>
            <SectionHead overline="In progress" title="Continue reading" rule={false} />

            {library.progress.length === 0 ? (
              <EmptyState
                title="Nothing in progress"
                description="Open a story and your place will be kept here."
                action={
                  <Button asChild variant="outline">
                    <Link to="/discover">Find something to read</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {library.progress.map(({ story, chapterId, percent, at }) => {
                  const chapter = story.chapters.find((item) => item.id === chapterId);

                  return (
                    <li key={story.id}>
                      <StoryRow
                        story={story}
                        trailing={
                          <div className="text-right">
                            <p className="font-mono text-[11px] text-ink-faint">{percent}%</p>
                            <Link
                              to={`/stories/${story.slug}/read/${chapterId}`}
                              className="mt-1 inline-flex min-h-11 items-center text-[12px] text-arcane-bright underline-offset-4 hover:underline sm:min-h-0"
                            >
                              Continue
                            </Link>
                            <p className="mt-1 text-[11px] text-ink-faint">
                              {formatRelativeDate(at)}
                            </p>
                          </div>
                        }
                      />
                      <div className="mb-4 h-px w-full bg-border">
                        <div className="h-px bg-arcane-bright" style={{ width: `${percent}%` }} />
                      </div>
                      {chapter ? (
                        <p className="mb-4 -mt-2 text-[11.5px] text-ink-faint">
                          Chapter {chapter.index}: {chapter.title}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Bookmarks */}
          <section className="mt-14">
            <SectionHead
              overline="Saved"
              title="Bookmarked"
              action={<span className="overline text-ink-faint">{library.bookmarks.length}</span>}
              rule={false}
            />

            {library.bookmarks.length === 0 ? (
              <EmptyState
                title="No bookmarks yet"
                description="Bookmark a story from its page and it will be kept here."
              />
            ) : (
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {library.bookmarks.map((story) => (
                  <li key={story.id}>
                    <StoryRow
                      story={story}
                      trailing={
                        <button
                          type="button"
                          onClick={() => removeBookmark(story.id)}
                          aria-label={`Remove bookmark for ${story.title}`}
                          className="flex size-11 items-center justify-center rounded-[3px] text-ink-faint transition-colors hover:bg-paper-muted hover:text-alert sm:size-9"
                        >
                          <BookmarkX className="size-4" aria-hidden="true" />
                        </button>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Following */}
          <section className="mt-14">
            <SectionHead
              overline="People"
              title="Following"
              action={<span className="overline text-ink-faint">{library.following.length}</span>}
              rule={false}
            />

            {library.following.length === 0 ? (
              <EmptyState
                title="Not following anyone yet"
                description="Follow a creator and their new chapters will appear here."
                action={
                  <Button asChild variant="outline">
                    <Link to="/creators">Browse creators</Link>
                  </Button>
                }
              />
            ) : (
              <div className="mt-2 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-12 sm:divide-y-0">
                {library.following.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} compact />
                ))}
              </div>
            )}
          </section>

          <div className="mt-14 border-t border-border pt-5">
            <p className="flex items-center gap-2 text-[12px] text-ink-faint">
              <Bookmark className="size-3.5" aria-hidden="true" />
              Reading progress and bookmarks are saved in this browser only — nothing is written to a
              server yet.
            </p>
          </div>
        </>
      )}
    </>
  );
}
