import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, BookOpen, Hourglass, Lock } from "lucide-react";

import { loreService, timelineService, universeService } from "@/services/mock-api";
import { formatRelativeDate, getInitials, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatRow, Stat } from "@/components/shared/stat-row";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { SectionHead } from "@/components/shared/section-head";
import { CanonBadge, GenreTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** WorldDetailPage — the worldbuilding workspace for one universe (§9.6, §9.7). */
export function WorldDetailPage() {
  const { universeId } = useParams();

  const [universe, setUniverse] = useState(null);
  const [lore, setLore] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      universeService.get(universeId),
      loreService.list(universeId),
      timelineService.list(universeId),
    ])
      .then(([universeData, loreData, eventData]) => {
        if (!active) return;
        if (!universeData) throw new Error("That universe could not be found.");
        setUniverse(universeData);
        setLore(loreData);
        setEvents(eventData);
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

  if (error) {
    return (
      <ErrorState
        title="Universe unavailable"
        message={error}
        onRetry={() => window.location.assign("/studio/worlds")}
        retryLabel="Back to Worldbuilding"
      />
    );
  }

  if (isLoading) {
    return <LoadingState variant="prose" label="Loading universe…" />;
  }

  const recent = [...lore]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const eras = [...new Set(events.map((event) => event.era))];

  return (
    <>
      <PageHeader
        overline="Create / Worldbuilding"
        title={universe.name}
        description={universe.description}
        backTo="/studio/worlds"
        backLabel="All universes"
        actions={
          <Button variant="outline" asChild>
            <Link to={`/universes/${universe.id}`}>Public page</Link>
          </Button>
        }
      />

      {/* Cover strip: the plate reads as a survey sheet, not a hero photo. */}
      <section className="relative mb-8 overflow-hidden border border-border bg-paper-muted">
        <div className="relative flex aspect-[21/9] max-h-[240px] items-center justify-center">
          <span aria-hidden="true" className="absolute inset-y-0 left-[22%] w-px bg-ink/10" />
          <span aria-hidden="true" className="absolute inset-y-0 left-[63%] w-px bg-ink/10" />
          <span aria-hidden="true" className="absolute inset-x-0 top-[38%] h-px bg-ink/10" />
          <span aria-hidden="true" className="absolute inset-x-0 bottom-[22%] h-px bg-ink/10" />

          <span
            aria-hidden="true"
            className="type-display relative text-[clamp(2.75rem,1.9rem+5vw,5.25rem)] leading-none text-crimson/20"
          >
            {getInitials(universe.name)}
          </span>

          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-2">
            <GenreTag>{universe.genre}</GenreTag>

            {universe.visibility === "private" ? (
              <span className="label-box border-ink/40 bg-paper/80 text-ink-muted">
                <Lock className="mr-1 size-2.5" aria-hidden="true" />
                Private
              </span>
            ) : (
              <span className="label-box border-ink/40 bg-paper/80 text-ink-muted">Public</span>
            )}
          </div>
        </div>
      </section>

      <StatRow columns={4}>
        <Stat value={universe.entries} label="Entries" />
        <Stat value={universe.characters} label="Characters" />
        <Stat value={universe.locations} label="Locations" />
        <Stat value={events.length} label="Events" />
      </StatRow>

      {/* Quick navigation — three places to work, stated plainly. */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to={`/studio/worlds/${universeId}/lore`}
          className="group flex items-start justify-between gap-4 border border-border p-5 transition-colors hover:border-ink"
        >
          <span className="min-w-0">
            <BookOpen className="size-4 text-crimson" aria-hidden="true" />
            <span className="mt-3 block font-ui text-[14.5px] font-medium text-ink group-hover:text-arcane-bright">
              Encyclopedia
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
              {pluralize(lore.length, "entry", "entries")} — characters, places, factions,
              artefacts and myths.
            </span>
          </span>
          <ArrowRight className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
        </Link>

        <Link
          to={`/studio/worlds/${universeId}/timeline`}
          className="group flex items-start justify-between gap-4 border border-border p-5 transition-colors hover:border-ink"
        >
          <span className="min-w-0">
            <Hourglass className="size-4 text-crimson" aria-hidden="true" />
            <span className="mt-3 block font-ui text-[14.5px] font-medium text-ink group-hover:text-arcane-bright">
              Timeline
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
              {pluralize(events.length, "event", "events")} across{" "}
              {pluralize(eras.length, "era", "eras")}.
            </span>
          </span>
          <ArrowRight className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
        </Link>
      </div>

      {/* Recently updated entries */}
      <section className="mt-12">
        <SectionHead
          overline="Recently updated"
          title="Latest entries"
          action={
            <Link
              to={`/studio/worlds/${universeId}/lore`}
              className="inline-flex min-h-11 items-center text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-arcane-bright sm:min-h-0"
            >
              All entries →
            </Link>
          }
          rule={false}
        />

        {recent.length === 0 ? (
          <p className="border-b border-border py-8 text-[13.5px] text-ink-muted">
            Nothing catalogued yet. The encyclopedia is the place to start.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border border-t border-border">
            {recent.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={`/studio/worlds/${universeId}/lore/${entry.id}`}
                  className="group flex items-baseline gap-3 py-3"
                >
                  <span className="w-[88px] shrink-0 truncate text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                    {entry.category}
                  </span>

                  <span className="min-w-0 flex-1 truncate font-ui text-[14.5px] font-medium text-ink group-hover:text-arcane-bright">
                    {entry.title}
                  </span>

                  <CanonBadge status={entry.canon} className="hidden sm:inline-flex" />

                  <span className="shrink-0 text-[11.5px] text-ink-faint">
                    {formatRelativeDate(entry.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12 border-t border-border pt-5">
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Universe creation is wired to the mock service. Entries and timeline events are added in
          this browser and are not written to a server.
        </p>
      </div>
    </>
  );
}
