import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { creatorService, libraryService } from "@/services/mock-api";
import { getInitials } from "@/lib/utils";
import { StoryCard } from "@/components/shared/story-card";
import { UniverseCard } from "@/components/shared/universe-card";
import { SectionHead } from "@/components/shared/section-head";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export function CreatorProfilePage() {
  const { handle } = useParams();

  const [creator, setCreator] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    creatorService
      .get(handle)
      .then((data) => {
        if (!active) return;
        if (!data) throw new Error("That creator is not in the archive.");
        setCreator(data);
        return libraryService.isFollowing(data.id);
      })
      .then((following) => {
        if (active && following !== undefined) setIsFollowing(following);
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
  }, [handle]);

  async function toggleFollow() {
    if (!creator) return;
    const next = await libraryService.toggleFollow(creator.id);
    setIsFollowing(next);
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState variant="rows" count={3} label="Loading creator…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorState title="Creator unavailable" message={error} />
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-border py-12 sm:py-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <span
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center border border-border-strong font-ui text-[26px] font-semibold text-crimson"
          >
            {getInitials(creator.name)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="overline text-arcane-bright">Creator</p>

            <h1 className="type-display mt-3 text-[clamp(1.85rem,1.4rem+2vw,2.7rem)] text-ink">
              {creator.name}
            </h1>

            <p className="type-num mt-2 text-ink-faint">
              @{creator.handle}
              {creator.location ? (
                <>
                  <span aria-hidden="true" className="mx-2">
                    ·
                  </span>
                  {creator.location}
                </>
              ) : null}
            </p>

            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-ink-muted">
              {creator.bio}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                variant={isFollowing ? "outline" : "primary"}
                onClick={toggleFollow}
                aria-pressed={isFollowing}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>

              <p className="text-[12px] uppercase tracking-[0.08em] text-ink-faint">
                {(creator.followers + (isFollowing ? 1 : 0)).toLocaleString("en-GB")} followers
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
                {creator.stories.length} stories
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
                {creator.universes.length} public worlds
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-10">
        <SectionHead overline="Published" title="Stories" />

        {creator.stories.length === 0 ? (
          <p className="border-b border-border py-10 text-[13.5px] text-ink-muted">
            This creator has not published a story yet.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {creator.stories.map((story) => (
              <StoryCard key={story.id} story={story} size="sm" />
            ))}
          </div>
        )}
      </section>

      {creator.universes.length > 0 ? (
        <section className="mt-16">
          <SectionHead
            overline="Worlds"
            title="Public universes"
            description="Structured archives of the places this creator's stories happen in."
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creator.universes.map((universe) => (
              <UniverseCard key={universe.id} universe={universe} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16 border-t border-border pt-10">
        <SectionHead overline="Keep reading" title="More in the archive" />

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/stories">Browse all stories</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/creators">All creators</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
