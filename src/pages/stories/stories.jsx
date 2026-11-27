import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { storyService } from "@/services/mock-api";
import { StoryCard } from "@/components/shared/story-card";
import { EditorialHeader } from "@/components/shared/section-head";
import { Toolbar, ToolbarSearch, ToolbarSelect, ToolbarGroup } from "@/components/shared/toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

const SORTS = [
  { value: "recent", label: "Recently published" },
  { value: "popular", label: "Most read" },
  { value: "alpha", label: "A–Z" },
];

export function StoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get("genre") ?? "all";

  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    let active = true;

    storyService
      .listPublished()
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
  }, [attempt]);

  const genres = useMemo(() => {
    const counts = new Map();
    for (const story of stories) counts.set(story.genre, (counts.get(story.genre) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [stories]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return stories
      .filter((story) => {
        const matchesTerm =
          !term ||
          story.title.toLowerCase().includes(term) ||
          story.author?.name.toLowerCase().includes(term) ||
          story.tags.some((tag) => tag.includes(term));

        return matchesTerm && (genreParam === "all" || story.genre === genreParam);
      })
      .sort((a, b) => {
        if (sort === "popular") return b.reads - a.reads;
        if (sort === "alpha") return a.title.localeCompare(b.title);
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
  }, [stories, query, genreParam, sort]);

  function setGenre(value) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("genre");
    else next.set("genre", value);
    setSearchParams(next, { replace: true });
  }

  return (
    <>
      <EditorialHeader
        overline="Catalogue"
        title="Stories"
        standfirst="Every published story in the archive, newest first. Filter by genre or search by title, author or tag."
      />

      <div className="py-8">
        <Toolbar>
          <ToolbarSearch value={query} onChange={setQuery} placeholder="Search the catalogue…" />

          <ToolbarSelect
            value={genreParam}
            onChange={(event) => setGenre(event.target.value)}
            aria-label="Filter by genre"
          >
            <option value="all">All genres ({stories.length})</option>
            {genres.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </ToolbarSelect>

          <ToolbarGroup>
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
          </ToolbarGroup>
        </Toolbar>
      </div>

      {error ? (
        <ErrorState
          title="The catalogue could not be loaded"
          message={error}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      ) : isLoading ? (
        <LoadingState variant="covers" count={10} label="Loading stories…" />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No published story matches those filters. Try another genre, or clear the search."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setGenre("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((story) => (
              <StoryCard key={story.id} story={story} size="sm" />
            ))}
          </div>

          <p
            className="mt-10 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint"
            aria-live="polite"
          >
            {visible.length} of {stories.length} stories
          </p>
        </>
      )}
    </>
  );
}
