import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Feather, Plus } from "lucide-react";

import { storyService } from "@/services/mock-api";
import { formatRelativeDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHead } from "@/components/shared/section-head";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

/**
 * WritingStudioPage — the story list for the writing half of the studio.
 * The editor itself lives at /studio/writing/:storyId.
 */
export function WritingStudioPage() {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    storyService
      .listAll()
      .then((data) => {
        if (active) setStories(data);
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

  const drafts = stories.filter((story) => story.status === "draft");
  const published = stories.filter((story) => story.status === "published");

  return (
    <>
      <PageHeader
        overline="Create / Writing"
        title="Writing Studio"
        description="Every story you are working on. Drafts stay private until you publish them."
        actions={
          <Button asChild>
            <Link to="/studio/writing/new">
              <Plus className="size-4" aria-hidden="true" />
              New Story
            </Link>
          </Button>
        }
      />

      {error ? (
        <ErrorState title="Stories could not be loaded" message={error} />
      ) : isLoading ? (
        <LoadingState variant="rows" count={4} label="Loading your stories…" />
      ) : stories.length === 0 ? (
        <EmptyState
          title="No stories yet"
          description="A story starts as a title and a synopsis. You can add chapters after that."
          action={
            <Button asChild>
              <Link to="/studio/writing/new">Start your first story</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section>
            <SectionHead
              overline="In progress"
              title="Drafts"
              action={<span className="overline text-ink-faint">{drafts.length}</span>}
              rule={false}
            />

            {drafts.length === 0 ? (
              <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
                No drafts. Everything you have written is published.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {drafts.map((story) => (
                  <li key={story.id}>
                    <Link
                      to={`/studio/writing/${story.id}`}
                      className="group flex items-center gap-4 border-l-2 border-transparent py-4 pl-4 transition-colors hover:border-crimson-bright hover:bg-paper-muted/40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center border border-border">
                        <Feather className="size-4 text-ink-faint" aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-ui text-[14.5px] font-semibold text-ink group-hover:text-arcane-bright">
                            {story.title}
                          </span>
                          <StatusBadge status={story.status} />
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                          {story.totalChapters} chapters · {story.wordCount.toLocaleString("en-GB")}{" "}
                          words · edited {formatRelativeDate(story.updatedAt)}
                        </span>
                      </span>

                      <span className="shrink-0 text-[12px] text-arcane-bright">Open editor →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-14">
            <SectionHead
              overline="Live"
              title="Published"
              action={<span className="overline text-ink-faint">{published.length}</span>}
              rule={false}
            />

            <ul className="mt-4 divide-y divide-border border-t border-border">
              {published.map((story) => (
                <li key={story.id} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/studio/writing/${story.id}`}
                      className="font-ui text-[14.5px] font-medium text-ink hover:text-arcane-bright"
                    >
                      {story.title}
                    </Link>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {story.chapterCount} published chapters ·{" "}
                      {story.reads.toLocaleString("en-GB")} reads
                    </p>
                  </div>

                  <Link
                    to={`/stories/${story.slug}`}
                    className="shrink-0 text-[12px] text-ink-muted underline-offset-4 hover:text-arcane-bright hover:underline"
                  >
                    View public page
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
