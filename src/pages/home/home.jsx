import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { creatorService, storyService, universeService } from "@/services/mock-api";
import { BookShelf } from "@/components/shared/book-shelf";
import { StoryCard } from "@/components/shared/story-card";
import { CreatorCard } from "@/components/shared/creator-card";
import { UniverseCard } from "@/components/shared/universe-card";
import { EditorialHeader, MoreLink, SectionHead } from "@/components/shared/section-head";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export function HomePage() {
  const [stories, setStories] = useState([]);
  const [creators, setCreators] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      storyService.listPublished(),
      creatorService.list(),
      universeService.listPublic(),
    ])
      .then(([storyData, creatorData, universeData]) => {
        if (!active) return;
        setStories(storyData);
        setCreators(creatorData);
        setUniverses(universeData);
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
  }, [attempt]);

  const recent = [...stories]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 10);

  const topCreators = [...creators].sort((a, b) => b.followers - a.followers).slice(0, 3);

  // Genre counts come from the data, never a hand-written seed list — a static
  // list drifts the moment a story is published.
  const genres = useMemo(() => {
    const counts = new Map();
    for (const story of stories) counts.set(story.genre, (counts.get(story.genre) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [stories]);

  if (error) {
    return (
      <div className="py-16">
        <ErrorState
          title="The archive could not be opened"
          message={error}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <>
      <EditorialHeader
        overline="Lorekeeper — a living library"
        title="Stories, worlds, and the campaigns that happen inside them."
        standfirst="A publishing platform for serialised fiction, a structured archive for fictional worlds, and a workspace for tabletop campaigns. Read something new, or start the world you have been carrying around."
        meta={
          <>
            <span>{stories.length} stories</span>
            <span aria-hidden="true">·</span>
            <span>{universes.length} public worlds</span>
            <span aria-hidden="true">·</span>
            <span>{creators.length} creators</span>
          </>
        }
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/discover">Start reading</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/studio/writing/new">Start writing</Link>
            </Button>
          </>
        }
      />

      {/* Featured shelf — the signature interaction: books standing spine-out,
          scrubbed by drag, arrow keys or a horizontal trackpad swipe. */}
      <section className="py-12 sm:py-16">
        {isLoading ? (
          <LoadingState variant="covers" count={5} label="Loading featured stories…" />
        ) : (
          <BookShelf stories={stories} />
        )}
      </section>

      {/* Recently published */}
      <section className="border-t border-border pt-10">
        <SectionHead
          overline="Newly set in type"
          title="Recently published"
          action={<MoreLink to="/stories">All stories</MoreLink>}
        />

        {isLoading ? (
          <div className="mt-8">
            <LoadingState variant="covers" count={5} label="Loading recently published stories…" />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {recent.map((story) => (
              <StoryCard key={story.id} story={story} size="sm" />
            ))}
          </div>
        )}
      </section>

      {/* Browse by genre — a rule-separated index, not chips in a cloud. */}
      <section className="mt-16 border-t border-border pt-10">
        <SectionHead overline="Browse" title="By genre" rule={false} />

        <ul className="mt-6 grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {genres.map(([name, count]) => (
            <li key={name} className="border-b border-border sm:border-r last:sm:border-r-0">
              <Link
                to={`/stories?genre=${encodeURIComponent(name)}`}
                className="group flex items-baseline justify-between gap-3 py-4 pr-4 transition-colors hover:text-arcane-bright sm:px-4 sm:first:pl-0"
              >
                <span className="type-section text-[17px] text-ink group-hover:text-arcane-bright">
                  {name}
                </span>
                <span className="type-meta text-ink-faint">
                  {String(count).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Creators */}
      <section className="mt-16 border-t border-border pt-10">
        <SectionHead
          overline="People"
          title="Creators worth following"
          action={<MoreLink to="/creators">All creators</MoreLink>}
        />

        <div className="mt-4 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {topCreators.map((creator, index) => (
            <div key={creator.id} className={index === 0 ? "sm:pr-6" : "sm:px-6"}>
              <CreatorCard creator={creator} />
            </div>
          ))}
        </div>
      </section>

      {/* Universes */}
      <section className="mt-16 border-t border-border pt-10">
        <SectionHead
          overline="Worlds"
          title="Fictional universes"
          description="Structured archives of the places these stories happen in — characters, locations, factions, and the history between them."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {universes.slice(0, 3).map((universe) => (
            <UniverseCard key={universe.id} universe={universe} showCreator />
          ))}
        </div>
      </section>

      {/* What Lorekeeper is — a closing editorial statement on the wine panel. */}
      <section className="mt-20 border-y border-crimson/30 bg-parchment py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <p className="overline text-brass">About the archive</p>

          <div>
            <h2 className="type-section text-[clamp(1.6rem,1.25rem+1.4vw,2.35rem)] text-ink">
              Three kinds of work, kept separately.
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Stories",
                  body: "Serialised fiction with chapters, drafts and a reading experience built for long text.",
                },
                {
                  title: "Universes",
                  body: "The world behind the work: characters, places, factions, artefacts and a timeline.",
                },
                {
                  title: "Campaigns",
                  body: "A game master's workspace — quests, NPCs, encounters and session notes.",
                },
              ].map((item) => (
                <div key={item.title} className="border-t border-brass/30 pt-4">
                  <h3 className="type-display text-[14px] text-brass">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-muted">
              They can exist independently or reference one another. A story does not need a
              universe, and a campaign does not need a story — but when they are linked, the archive
              remembers how.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
