import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookMarked, Plus } from "lucide-react";

import { universeService } from "@/services/mock-api";
import { formatRelativeDate, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, ToolbarSearch, ToolbarSelect, ToolbarGroup } from "@/components/shared/toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { GenreTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SORTS = [
  { value: "recent", label: "Recently updated" },
  { value: "opened", label: "Recently opened" },
  { value: "alpha", label: "A–Z" },
];

/**
 * WorldsPage — the universe index for the worldbuilding workspace.
 *
 * A ruled list, not a card grid: the name, the genre stamp and the counts sit
 * on one line so a keeper can scan five worlds without scrolling. Creation
 * lives on its own page, because it asks for thought.
 */
export function WorldsPage() {
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    let active = true;

    universeService
      .list()
      .then((data) => {
        if (active) setUniverses(data);
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

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return universes
      .filter((universe) => {
        const matchesTerm =
          !term ||
          universe.name.toLowerCase().includes(term) ||
          universe.description.toLowerCase().includes(term) ||
          universe.genre.toLowerCase().includes(term);

        return matchesTerm && (visibility === "all" || universe.visibility === visibility);
      })
      .sort((a, b) => {
        if (sort === "alpha") return a.name.localeCompare(b.name);
        if (sort === "opened") return new Date(b.openedAt) - new Date(a.openedAt);
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
  }, [universes, query, visibility, sort]);

  const hasFilters = query.trim().length > 0 || visibility !== "all";

  return (
    <>
      <PageHeader
        overline="Create / Worldbuilding"
        title="Worldbuilding"
        description="The universes you maintain: their encyclopedias, timelines and linked stories."
        actions={
          <Button asChild>
            <Link to="/studio/worlds/new">
              <Plus className="size-4" aria-hidden="true" />
              New Universe
            </Link>
          </Button>
        }
      />

      {error ? (
        <ErrorState title="Universes could not be loaded" message={error} />
      ) : isLoading ? (
        <LoadingState variant="rows" count={4} label="Loading universes…" />
      ) : universes.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No universes yet"
          description="A world begins with a name and one sentence about the place. Everything else is catalogued afterwards."
          action={
            <Button asChild>
              <Link to="/studio/worlds/new">Create your first universe</Link>
            </Button>
          }
        />
      ) : (
        <>
          <Toolbar>
            <ToolbarSearch
              value={query}
              onChange={setQuery}
              placeholder="Search worlds, genres…"
            />

            <ToolbarSelect
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              aria-label="Filter by visibility"
            >
              <option value="all">All worlds</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </ToolbarSelect>

            <ToolbarGroup>
              <ToolbarSelect
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort worlds"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ToolbarSelect>
            </ToolbarGroup>
          </Toolbar>

          {visible.length === 0 ? (
            <EmptyState
              title="No world matches those filters"
              description="Try another visibility, or clear the search to see every universe in the archive."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setVisibility("all");
                  }}
                >
                  Reset filters
                </Button>
              }
            />
          ) : (
            <ul className="border-t border-border">
              {visible.map((universe) => (
                <li key={universe.id}>
                  <Link
                    to={`/studio/worlds/${universe.id}`}
                    className="group flex items-start gap-4 border-b border-border py-4 transition-colors hover:bg-paper-muted/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-[17.5px] text-ink group-hover:text-arcane-bright">
                          {universe.name}
                        </span>
                        <GenreTag>{universe.genre}</GenreTag>
                        <span className="label-box border-border-strong text-ink-faint">
                          {universe.visibility}
                        </span>
                      </span>

                      <span className="clamp-2 mt-1.5 block text-[13px] leading-relaxed text-ink-muted">
                        {universe.description}
                      </span>

                      <span className="mt-2 block text-[11.5px] text-ink-faint">
                        {pluralize(universe.entries, "entry", "entries")} ·{" "}
                        {pluralize(universe.events, "event", "events")} ·{" "}
                        {pluralize(universe.stories.length, "linked story", "linked stories")} ·
                        updated {formatRelativeDate(universe.updatedAt)}
                      </span>
                    </span>

                    <span className="hidden shrink-0 self-center text-[12px] text-arcane-bright sm:block">
                      Open →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p
            className="mt-6 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint"
            aria-live="polite"
          >
            {hasFilters
              ? `${visible.length} of ${universes.length} worlds`
              : pluralize(universes.length, "universe")}
          </p>
        </>
      )}
    </>
  );
}
