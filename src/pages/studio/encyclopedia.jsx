import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { LayoutGrid, List, Plus } from "lucide-react";

import { loreService, universeService } from "@/services/mock-api";
import { formatRelativeDate, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar, ToolbarSearch, ToolbarSelect, ToolbarGroup } from "@/components/shared/toolbar";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CanonBadge, GenreTag } from "@/components/ui/badge";
import { SegmentedControl, Tab, Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LORE_CATEGORIES } from "@/schemas/lore-schema";

/**
 * EncyclopediaPage — the lore archive for one universe (§9.7).
 *
 * A printed index rather than a card grid: entries carry a category overline,
 * a serif title and a two-line summary, with canon status as a catalogue tag.
 * The view toggle switches between a three-column index and a ruled list.
 */
export function EncyclopediaPage() {
  const { universeId } = useParams();

  const [universe, setUniverse] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [canon, setCanon] = useState("all");
  const [view, setView] = useState("grid");
  const [openEntry, setOpenEntry] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([universeService.get(universeId), loreService.list(universeId)])
      .then(([universeData, entryData]) => {
        if (!active) return;
        if (!universeData) throw new Error("That universe could not be found.");
        setUniverse(universeData);
        setEntries(entryData);
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
  }, [universeId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return entries
      .filter((entry) => {
        const matchesTerm =
          !term ||
          entry.title.toLowerCase().includes(term) ||
          entry.summary.toLowerCase().includes(term) ||
          entry.tags.some((tag) => tag.includes(term));

        return (
          matchesTerm &&
          (category === "all" || entry.category === category) &&
          (canon === "all" || entry.canon === canon)
        );
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [entries, query, category, canon]);

  const counts = useMemo(
    () => ({
      all: entries.length,
      canon: entries.filter((entry) => entry.canon === "canon").length,
      draft: entries.filter((entry) => entry.canon === "draft").length,
      legend: entries.filter((entry) => entry.canon === "legend").length,
    }),
    [entries],
  );

  const hasFilters = query.trim().length > 0 || category !== "all" || canon !== "all";

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setCanon("all");
  }

  if (error) {
    return (
      <>
        <PageHeader overline="Create / Worldbuilding / Encyclopedia" title="Encyclopedia" />
        <ErrorState title="Encyclopedia unavailable" message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Create / Worldbuilding / Encyclopedia"
        title={universe ? universe.name : "Encyclopedia"}
        description={
          universe
            ? `${pluralize(entries.length, "entry", "entries")} catalogued across ${universe.genre}. Characters, places, factions, artefacts and the stories the world tells about itself.`
            : "Loading the archive…"
        }
        backTo={`/studio/worlds/${universeId}`}
        backLabel="World overview"
        actions={
          <>
            <SegmentedControl
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: "Grid", icon: LayoutGrid },
                { value: "list", label: "List", icon: List },
              ]}
            />
            <Button asChild>
              <Link to={`/studio/worlds/${universeId}/lore/new`}>
                <Plus className="size-4" aria-hidden="true" />
                New Entry
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <Toolbar>
          <ToolbarSearch
            value={query}
            onChange={setQuery}
            placeholder="Search entries, tags…"
          />

          <ToolbarSelect
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {LORE_CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </ToolbarSelect>

          <ToolbarGroup>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            ) : null}
          </ToolbarGroup>
        </Toolbar>

        <Tabs aria-label="Filter by canon status" className="overflow-x-auto">
          {[
            ["all", "All entries"],
            ["canon", "Canon"],
            ["draft", "Draft"],
            ["legend", "Legend"],
          ].map(([value, label]) => (
            <Tab
              key={value}
              active={canon === value}
              onClick={() => setCanon(value)}
              className="shrink-0"
            >
              {label}
              <span className="font-mono text-[11px] text-ink-faint">{counts[value]}</span>
            </Tab>
          ))}
        </Tabs>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <LoadingState variant="rows" count={5} label="Loading entries…" />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing catalogued yet"
            description="An encyclopedia starts with one entry. A character, a harbour, a rumour — any of them will do."
            action={
              <Button asChild>
                <Link to={`/studio/worlds/${universeId}/lore/new`}>Write the first entry</Link>
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No entry matches those filters"
            description="Try another category or canon status, or clear the search to see the whole index."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        </div>
      ) : view === "grid" ? (
        <ul className="mt-8 grid gap-x-10 gap-y-0 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry) => (
            <li key={entry.id} className="border-t border-border">
              <button
                type="button"
                onClick={() => setOpenEntry(entry)}
                className="group flex h-full w-full flex-col py-4 pr-2 text-left transition-colors hover:bg-paper-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright"
              >
                <span className="overline text-brass">{entry.category}</span>

                <span className="mt-2 font-serif text-[17px] leading-[1.3] text-ink group-hover:text-arcane-bright">
                  {entry.title}
                </span>

                <span className="clamp-2 mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {entry.summary}
                </span>

                <span className="mt-auto flex items-center gap-2 pt-3">
                  <CanonBadge status={entry.canon} />
                  <span className="text-[11.5px] text-ink-faint">
                    edited {formatRelativeDate(entry.updatedAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-8 border-t border-border">
          {filtered.map((entry) => (
            <li key={entry.id} className="border-b border-border">
              <button
                type="button"
                onClick={() => setOpenEntry(entry)}
                className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-3 py-3 text-left transition-colors hover:bg-paper-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-serif text-[15.5px] text-ink group-hover:text-arcane-bright">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-ink-faint sm:hidden">
                    {entry.category} · edited {formatRelativeDate(entry.updatedAt)}
                  </span>
                </span>

                <span className="hidden truncate text-[12.5px] text-ink-muted sm:block">
                  {entry.category}
                </span>

                <CanonBadge status={entry.canon} className="hidden sm:inline-flex" />

                <span className="hidden whitespace-nowrap text-[11.5px] text-ink-faint sm:block">
                  {formatRelativeDate(entry.updatedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && filtered.length > 0 ? (
        <p className="mt-6 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint" aria-live="polite">
          {hasFilters
            ? `${filtered.length} of ${entries.length} entries`
            : `${entries.length} entries`}
        </p>
      ) : null}

      {/* Entry detail — read in place, then move to the editor. */}
      <Dialog open={Boolean(openEntry)} onOpenChange={(open) => (open ? null : setOpenEntry(null))}>
        <DialogContent size="lg">
          {openEntry ? (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <GenreTag>{openEntry.category}</GenreTag>
                  <CanonBadge status={openEntry.canon} />
                </div>

                <DialogTitle className="mt-2">{openEntry.title}</DialogTitle>
                <DialogDescription>{openEntry.summary}</DialogDescription>
              </DialogHeader>

              <div className="max-h-[46vh] overflow-y-auto border-y border-border py-4">
                {openEntry.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="mb-3 font-serif text-[15px] leading-[1.7] text-ink last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {openEntry.tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {openEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex h-6 items-center border border-border-strong px-2 text-[11px] text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <DialogFooter>
                <p className="mr-auto text-[11.5px] text-ink-faint">
                  Edited {formatRelativeDate(openEntry.updatedAt)}
                </p>

                <Button variant="ghost" onClick={() => setOpenEntry(null)}>
                  Close
                </Button>

                <Button asChild>
                  <Link to={`/studio/worlds/${universeId}/lore/${openEntry.id}`}>
                    Open in editor
                  </Link>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Deep link from the universe overview: ?entry=<id> opens that entry. */}
    </>
  );
}
