import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Feather, Hourglass, Plus, Compass } from "lucide-react";

import {
  libraryService,
  loreService,
  storyService,
  timelineService,
  universeService,
} from "@/services/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeDate, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatRow, Stat } from "@/components/shared/stat-row";
import { SectionHead } from "@/components/shared/section-head";
import { StoryRow } from "@/components/shared/story-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/card";

/**
 * DashboardPage — the keeper's desk (§9.1 for the signed-in case).
 *
 * Figures are set as folio numbers over a rule, never KPI tiles; the page reads
 * top-down as: who you are, what the archive holds, what you were reading, what
 * you last touched, and the three things worth doing next.
 */
export function DashboardPage() {
  const { user } = useAuth();

  const [universes, setUniverses] = useState([]);
  const [stories, setStories] = useState([]);
  const [lore, setLore] = useState([]);
  const [events, setEvents] = useState([]);
  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      universeService.list(),
      storyService.listMine(),
      loreService.list(),
      timelineService.list(),
      libraryService.get(),
    ])
      .then(([universeData, storyData, loreData, eventData, libraryData]) => {
        if (!active) return;
        setUniverses(universeData);
        setStories(storyData);
        setLore(loreData);
        setEvents(eventData);
        setLibrary(libraryData);
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

  const recentUniverses = useMemo(
    () =>
      [...universes]
        .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))
        .slice(0, 3),
    [universes],
  );

  const drafts = useMemo(
    () => stories.filter((story) => story.status === "draft").slice(0, 3),
    [stories],
  );

  const firstName = (user?.name ?? "keeper").split(" ")[0];

  if (error) {
    return (
      <>
        <PageHeader overline="Workspace" title="Dashboard" />
        <ErrorState title="The archive could not be opened" message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Workspace"
        title={`Welcome back, ${firstName}.`}
        description="The state of your archive: what it holds, what you were reading, and what is waiting to be finished."
        actions={
          <Button asChild>
            <Link to="/studio/worlds/new">
              <Plus className="size-4" aria-hidden="true" />
              New Universe
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState variant="rows" count={4} label="Loading your archive…" />
      ) : (
        <>
          <StatRow columns={4}>
            <Stat
              value={universes.length}
              label="Universes"
              note={`${universes.filter((universe) => universe.visibility === "public").length} public`}
            />
            <Stat value={lore.length} label="Lore entries" />
            <Stat value={events.length} label="Timeline events" />
            <Stat
              value={stories.length}
              label="Stories"
              note={`${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
            />
          </StatRow>

          {/* Recently opened worlds */}
          <section className="mt-12">
            <SectionHead
              overline="Recently opened"
              title="Your worlds"
              action={
                <Link
                  to="/studio/worlds"
                  className="inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-arcane-bright sm:min-h-0"
                >
                  All universes →
                </Link>
              }
              rule={false}
            />

            {recentUniverses.length === 0 ? (
              <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
                No universe yet. A world starts with a name and a sentence.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-t border-border">
                {recentUniverses.map((universe) => (
                  <li key={universe.id}>
                    <Link
                      to={`/studio/worlds/${universe.id}`}
                      className="group flex items-baseline gap-4 py-3.5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[16.5px] text-ink group-hover:text-arcane-bright">
                          {universe.name}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                          {universe.genre} · {pluralize(universe.entries, "entry", "entries")} ·{" "}
                          {universe.visibility}
                        </span>
                      </span>

                      <span className="shrink-0 text-[11.5px] text-ink-faint">
                        opened {formatRelativeDate(universe.openedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Continue reading */}
          <section className="mt-14">
            <SectionHead
              overline="Reading"
              title="Continue reading"
              action={
                <Link
                  to="/library"
                  className="inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-arcane-bright sm:min-h-0"
                >
                  My library →
                </Link>
              }
              rule={false}
            />

            {!library || library.progress.length === 0 ? (
              <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
                Nothing in progress.{" "}
                <Link to="/discover" className="text-arcane-bright underline-offset-4 hover:underline">
                  Find something to read
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-t border-border">
                {library.progress.slice(0, 3).map(({ story, chapterId, percent, at }) => (
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
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Drafts */}
          <section className="mt-14">
            <SectionHead
              overline="Writing"
              title="Unfinished"
              action={
                <Link
                  to="/studio/writing"
                  className="inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-arcane-bright sm:min-h-0"
                >
                  Writing studio →
                </Link>
              }
              rule={false}
            />

            {drafts.length === 0 ? (
              <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
                No open drafts.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-t border-border">
                {drafts.map((story) => (
                  <li key={story.id}>
                    <Link
                      to={`/studio/writing/${story.id}`}
                      className="group flex items-baseline gap-4 py-3.5"
                    >
                      <Feather className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[16px] text-ink group-hover:text-arcane-bright">
                          {story.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                          {story.totalChapters} chapters ·{" "}
                          {story.wordCount.toLocaleString("en-GB")} words
                        </span>
                      </span>
                      <span className="shrink-0 text-[11.5px] text-ink-faint">
                        {formatRelativeDate(story.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick actions — three doors, stated plainly. */}
          <section className="mt-14">
            <Overline className="border-b border-border pb-2">Next</Overline>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                {
                  to: "/studio/writing/new",
                  icon: Feather,
                  title: "Start a story",
                  body: "A title and a synopsis is enough to open the file.",
                },
                {
                  to: "/studio/worlds/new",
                  icon: BookOpen,
                  title: "Open a world",
                  body: "Name a universe, then catalogue what lives in it.",
                },
                {
                  to: "/discover",
                  icon: Compass,
                  title: "Read something",
                  body: "Everything published in the archive, newest first.",
                },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group border border-border p-5 transition-colors hover:border-ink"
                >
                  <action.icon className="size-4 text-crimson" aria-hidden="true" />
                  <p className="mt-3 font-serif text-[16px] text-ink group-hover:text-arcane-bright">
                    {action.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {action.body}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <p className="mt-12 flex items-center gap-2 border-t border-border pt-4 text-[11.5px] text-ink-faint">
            <Hourglass className="size-3.5" aria-hidden="true" />
            Everything here is saved in this browser only — there is no server behind this build.
          </p>
        </>
      )}
    </>
  );
}
