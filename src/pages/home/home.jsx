import { useEffect, useState } from "react";
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

    </>
  );
}
