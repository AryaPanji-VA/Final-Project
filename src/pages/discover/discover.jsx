import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import { creatorService, storyService, universeService } from "@/services/mock-api";
import { StoryCard } from "@/components/shared/story-card";
import { StoryCover } from "@/components/shared/story-cover";
import { CreatorCard } from "@/components/shared/creator-card";
import { UniverseCard } from "@/components/shared/universe-card";
import { EditorialHeader, MoreLink, SectionHead } from "@/components/shared/section-head";
import { Toolbar, ToolbarSearch, ToolbarSelect, ToolbarGroup } from "@/components/shared/toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SegmentedControl } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const SORTS = [
  { value: "recent", label: "Recently published" },
  { value: "popular", label: "Most read" },
  { value: "liked", label: "Most liked" },
  { value: "alpha", label: "A–Z" },
];

export function DiscoverPage() {
  const [stories, setStories] = useState([]);
  const [creators, setCreators] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("stories");

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

  const genres = useMemo(() => {
    const counts = new Map();
    for (const story of stories) counts.set(story.genre, (counts.get(story.genre) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [stories]);

  // The featured band shows the most-read story that the data marks featured,
  // falling back to the most-read overall so the slot is never empty.
  const featured = useMemo(() => {
    const flagged = stories.find((story) => story.featured);
    if (flagged) return flagged;
    return [...stories].sort((a, b) => b.reads - a.reads)[0] ?? null;
  }, [stories]);

  const hasFilters = query.trim().length > 0 || genre !== "all";

  const visibleStories = useMemo(() => {
    const term = query.trim().toLowerCase();

    return stories
      .filter((story) => {
        const matchesTerm =
          !term ||
          story.title.toLowerCase().includes(term) ||
          story.synopsis.toLowerCase().includes(term) ||
          story.author?.name.toLowerCase().includes(term) ||
          story.tags.some((tag) => tag.includes(term));

        return matchesTerm && (genre === "all" || story.genre === genre);
      })
      .sort((a, b) => {
        if (sort === "popular") return b.reads - a.reads;
        if (sort === "liked") return b.likes - a.likes;
        if (sort === "alpha") return a.title.localeCompare(b.title);
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
  }, [stories, query, genre, sort]);

  const visibleCreators = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [...creators].sort((a, b) => b.followers - a.followers);

    return creators.filter(
      (creator) =>
        creator.name.toLowerCase().includes(term) ||
        creator.handle.includes(term) ||
        creator.bio.toLowerCase().includes(term),
    );
  }, [creators, query]);

  const visibleUniverses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return universes;

    return universes.filter(
      (universe) =>
        universe.name.toLowerCase().includes(term) ||
        universe.description.toLowerCase().includes(term) ||
        universe.genre.toLowerCase().includes(term),
    );
  }, [universes, query]);

  function resetFilters() {
    setQuery("");
    setGenre("all");
  }

  return (
    <>
      <EditorialHeader
        align="center"
        overline="Discover"
        title="The reading room."
        standfirst="Everything published here is original, serialised, and still being written. Browse by genre, follow a creator, or start at the most recent."
        meta={
          <>
            <span>{stories.length} published stories</span>
            <span aria-hidden="true">·</span>
            <span>{universes.length} public worlds</span>
          </>
        }
      />

      {/* Featured — one story given the width it deserves, before the grid. */}
      {!isLoading && !error && featured ? (
        <section aria-labelledby="featured-heading" className="mt-10 border-y border-border py-8">
          <div className="grid gap-8 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-10 lg:grid-cols-[220px_1fr]">
            <Link
              to={`/stories/${featured.slug}`}
              className="mx-auto block w-full max-w-[180px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:mx-0 sm:max-w-none"
            >
              <StoryCover
                story={featured}
                size="md"
                className="shadow-[0_20px_44px_-28px_rgba(0,0,0,0.6)]"
              />
            </Link>

            <div className="min-w-0">
              <p className="overline text-brass">Featured this week</p>

              <h2
                id="featured-heading"
                className="type-page mt-3 max-w-[24ch] text-[clamp(1.6rem,1.25rem+1.5vw,2.4rem)] text-ink"
              >
                <Link to={`/stories/${featured.slug}`} className="hover:text-arcane-bright">
                  {featured.title}
                </Link>
              </h2>

              <p className="mt-3 max-w-[60ch] text-[14px] leading-[1.7] text-ink-muted">
                {featured.synopsis}
              </p>

              <p className="mt-4 text-[12.5px] text-ink-faint">
                {featured.author?.name}
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
                {featured.genre}
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
                {featured.chapterCount} chapters
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
                {featured.reads.toLocaleString("en-GB")} reads
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link to={`/stories/${featured.slug}`}>Open the story</Link>
                </Button>

                {featured.universe ? (
                  <Button asChild variant="ghost">
                    <Link to={`/universes/${featured.universe.id}`}>
                      The world it happens in
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="py-8">
        <Toolbar>
          <ToolbarSearch
            value={query}
            onChange={setQuery}
            placeholder="Search titles, authors, tags…"
          />

          <ToolbarSelect
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            aria-label="Filter by genre"
          >
            <option value="all">All genres</option>
            {genres.map(([name]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </ToolbarSelect>

          <ToolbarGroup>
            {view === "stories" ? (
              <ToolbarSelect
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort stories"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ToolbarSelect>
            ) : null}

            <SegmentedControl
              label="Browse"
              value={view}
              onChange={setView}
              options={[
                { value: "stories", label: "Stories" },
                { value: "creators", label: "Creators" },
                { value: "worlds", label: "Worlds" },
              ]}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>

      {error ? (
        <ErrorState
          title="Discover could not be loaded"
          message={error}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      ) : isLoading ? (
        <LoadingState variant="covers" count={10} label="Loading published stories…" />
      ) : view === "stories" ? (
        <>
          {visibleStories.length === 0 ? (
            <EmptyState
              title="No story matches those filters"
              description="Try a different genre, or clear the search to see everything that has been published."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleStories.map((story) => (
                <StoryCard key={story.id} story={story} size="sm" />
              ))}
            </div>
          )}

          <p
            className="mt-8 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint"
            aria-live="polite"
          >
            {hasFilters
              ? `${visibleStories.length} of ${stories.length} stories`
              : `${stories.length} published stories`}
          </p>
        </>
      ) : view === "creators" ? (
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0">
          {visibleCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleUniverses.map((universe) => (
            <UniverseCard key={universe.id} universe={universe} showCreator />
          ))}
        </div>
      )}

      <section className="mt-20 border-t border-border pt-10">
        <SectionHead
          overline="Keep going"
          title="Browse the whole catalogue"
          action={<MoreLink to="/stories">All stories</MoreLink>}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            to="/creators"
            className="group border border-border p-6 transition-colors hover:border-ink"
          >
            <p className="overline text-ink-faint">Creators</p>
            <p className="mt-2 type-section text-[21px] text-ink group-hover:text-arcane-bright">
              Browse everyone publishing here
            </p>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              Follow a writer and their new chapters appear in your library.
            </p>
          </Link>

          <Link
            to="/studio/writing/new"
            className="group border border-border p-6 transition-colors hover:border-ink"
          >
            <p className="overline text-ink-faint">Publish</p>
            <p className="mt-2 type-section text-[21px] text-ink group-hover:text-arcane-bright">
              Put your own work on the shelf
            </p>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              Draft privately, then publish a story and its chapters when you are ready.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
