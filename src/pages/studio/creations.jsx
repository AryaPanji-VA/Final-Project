import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Feather, Swords, BookMarked } from "lucide-react";

import { campaignService, storyService, universeService } from "@/services/mock-api";
import { formatRelativeDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatRow, Stat } from "@/components/shared/stat-row";
import { SectionHead } from "@/components/shared/section-head";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export function CreationsPage() {
  const [stories, setStories] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      storyService.listAll(),
      universeService.list(),
      campaignService.list(),
    ])
      .then(([storyData, universeData, campaignData]) => {
        if (!active) return;
        setStories(storyData);
        setUniverses(universeData);
        setCampaigns(campaignData);
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

  if (error) {
    return (
      <>
        <PageHeader overline="Create" title="My Creations" />
        <ErrorState title="Your creations could not be loaded" message={error} />
      </>
    );
  }

  const drafts = stories.filter((story) => story.status === "draft");
  const published = stories.filter((story) => story.status === "published");
  const totalWords = stories.reduce((sum, story) => sum + story.wordCount, 0);

  return (
    <>
      <PageHeader
        overline="Create"
        title="My Creations"
        description="Everything you are writing, building and running — drafts first."
        actions={
          <Button asChild>
            <Link to="/studio/writing/new">
              <Feather className="size-4" aria-hidden="true" />
              New Story
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState variant="rows" count={4} label="Loading your creations…" />
      ) : (
        <>
          <StatRow columns={4}>
            <Stat value={stories.length} label="Stories" note={`${published.length} published`} />
            <Stat value={drafts.length} label="Drafts" />
            <Stat value={universes.length} label="Universes" />
            <Stat value={totalWords.toLocaleString("en-GB")} label="Words written" />
          </StatRow>

          {/* Drafts — the actionable list. */}
          <section className="mt-12">
            <SectionHead
              overline="Unfinished"
              title="Drafts"
              action={<span className="overline text-ink-faint">{drafts.length}</span>}
              rule={false}
            />

            {drafts.length === 0 ? (
              <EmptyState
                title="No drafts open"
                description="Start a story and it will wait here until you publish it."
                action={
                  <Button asChild variant="outline">
                    <Link to="/studio/writing/new">Start a story</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {drafts.map((story) => (
                  <li key={story.id}>
                    <Link
                      to={`/studio/writing/${story.id}`}
                      className="group flex items-center gap-4 py-4 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-[16.5px] text-ink group-hover:text-arcane-bright">
                            {story.title}
                          </h3>
                          <StatusBadge status={story.status} />
                        </div>
                        <p className="clamp-2 mt-1 text-[13px] text-ink-muted">{story.synopsis}</p>
                        <p className="mt-1.5 text-[11.5px] text-ink-faint">
                          {story.totalChapters} chapters · {story.wordCount.toLocaleString("en-GB")}{" "}
                          words · edited {formatRelativeDate(story.updatedAt)}
                        </p>
                      </div>

                      <span className="shrink-0 text-[12px] text-arcane-bright">Continue →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Published */}
          <section className="mt-14">
            <SectionHead
              overline="Live"
              title="Published"
              action={<span className="overline text-ink-faint">{published.length}</span>}
              rule={false}
            />

            {published.length === 0 ? (
              <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
                Nothing published yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {published.map((story) => (
                  <li key={story.id} className="flex items-center gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/stories/${story.slug}`}
                        className="font-serif text-[16px] text-ink hover:text-arcane-bright"
                      >
                        {story.title}
                      </Link>
                      <p className="mt-0.5 text-[11.5px] text-ink-faint">
                        {story.chapterCount} chapters · {story.reads.toLocaleString("en-GB")} reads ·{" "}
                        {story.likes.toLocaleString("en-GB")} likes
                      </p>
                    </div>

                    <Link
                      to={`/studio/writing/${story.id}`}
                      className="inline-flex min-h-11 shrink-0 items-center text-[12px] text-arcane-bright underline-offset-4 hover:underline sm:min-h-0"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Universes + campaigns */}
          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <section>
              <SectionHead
                overline="Worldbuilding"
                title="Universes"
                action={
                  <Link
                    to="/studio/worlds"
                    className="text-[12px] uppercase tracking-[0.1em] text-ink-muted hover:text-arcane-bright"
                  >
                    Manage →
                  </Link>
                }
                rule={false}
              />

              <ul className="mt-4 divide-y divide-border border-t border-border">
                {universes.map((universe) => (
                  <li key={universe.id} className="flex items-center gap-3 py-3">
                    <BookMarked className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/studio/worlds/${universe.id}`}
                        className="font-serif text-[15px] text-ink hover:text-arcane-bright"
                      >
                        {universe.name}
                      </Link>
                      <p className="text-[11.5px] text-ink-faint">
                        {universe.entries} entries · {universe.stories.length} stories
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHead
                overline="RPG Studio"
                title="Campaigns"
                action={
                  <Link
                    to="/studio/campaigns"
                    className="text-[12px] uppercase tracking-[0.1em] text-ink-muted hover:text-arcane-bright"
                  >
                    Manage →
                  </Link>
                }
                rule={false}
              />

              <ul className="mt-4 divide-y divide-border border-t border-border">
                {campaigns.map((campaign) => (
                  <li key={campaign.id} className="flex items-center gap-3 py-3">
                    <Swords className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[15px] text-ink">{campaign.title}</p>
                      <p className="text-[11.5px] text-ink-faint">
                        {campaign.system} · {campaign.sessions} sessions · {campaign.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
}
