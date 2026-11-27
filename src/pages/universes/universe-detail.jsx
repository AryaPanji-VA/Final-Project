import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Lock } from "lucide-react";

import { loreService, timelineService, universeService } from "@/services/mock-api";
import { formatRelativeDate, getInitials, pluralize } from "@/lib/utils";
import { StoryCard } from "@/components/shared/story-card";
import { StatRow, Stat } from "@/components/shared/stat-row";
import { SectionHead } from "@/components/shared/section-head";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { CanonBadge, GenreTag } from "@/components/ui/badge";

const CATEGORY_ORDER = ["Character", "Location", "Faction", "Artifact", "Mythology", "Event"];

export function UniverseDetailPage() {
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
        if (!universeData) throw new Error("This universe is not in the archive.");
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

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState variant="prose" label="Loading universe…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorState title="Universe unavailable" message={error} />
      </div>
    );
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    entries: lore.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);

  const eras = [...new Set(events.map((event) => event.era))];

  return (
    <>
      {/* Cover strip — a 240px cartographic plate, not a full-bleed hero.
          There is no key art in this build, so the plate is drawn: a tone
          field, a survey grid, the world's initials, and the genre stamp. */}
      <section className="mt-8 border border-border">
        <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-paper-muted sm:h-[220px] lg:h-[240px]">
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

          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            <GenreTag className="border-ink/30 bg-paper/80">{universe.genre}</GenreTag>

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

      <header className="border-b border-border py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <h1 className="type-display max-w-[24ch] text-[clamp(1.85rem,1.4rem+2vw,2.9rem)] text-ink">
              {universe.name}
            </h1>

            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-ink-muted sm:text-[16px]">
              {universe.description}
            </p>

            <p className="mt-5 text-[13px] text-ink-muted">
              Built by{" "}
              <Link
                to={`/creators/${universe.creator?.handle}`}
                className="text-ink underline-offset-4 hover:text-arcane-bright hover:underline"
              >
                {universe.creator?.name}
              </Link>
              <span aria-hidden="true" className="mx-2 text-ink-faint">
                ·
              </span>
              updated {formatRelativeDate(universe.updatedAt)}
            </p>
          </div>

          {universe.stories.length > 0 ? (
            <div className="shrink-0">
              <p className="overline text-ink-faint">Stories set here</p>
              <p className="type-display mt-1.5 text-[19px] leading-none text-brass">
                {universe.stories.length}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="pt-8">
        <StatRow columns={4}>
          <Stat value={universe.entries} label="Entries" />
          <Stat value={universe.characters} label="Characters" />
          <Stat value={universe.locations} label="Locations" />
          <Stat value={events.length} label="Events" />
        </StatRow>
      </div>

      {/* Quick navigation — three places to keep working on the world. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            to: `/studio/worlds/${universe.id}/lore`,
            title: "Encyclopedia",
            body: `${pluralize(lore.length, "entry", "entries")} catalogued`,
          },
          {
            to: `/studio/worlds/${universe.id}/timeline`,
            title: "Timeline",
            body: `${pluralize(events.length, "event", "events")} across ${pluralize(eras.length, "era", "eras")}`,
          },
          {
            to: `/studio/worlds/${universe.id}`,
            title: "Workspace",
            body: "Edit this world's archive",
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center justify-between gap-3 border border-border px-4 py-3 transition-colors hover:border-ink"
          >
            <span className="min-w-0">
              <span className="block font-ui text-[14px] font-medium text-ink group-hover:text-arcane-bright">
                {item.title}
              </span>
              <span className="mt-0.5 block truncate text-[11.5px] text-ink-faint">
                {item.body}
              </span>
            </span>
            <span aria-hidden="true" className="shrink-0 text-ink-faint">
              →
            </span>
          </Link>
        ))}
      </div>

      {/* Lore, grouped by category — an index, not a card grid. */}
      <section className="mt-14">
        <SectionHead
          overline="Encyclopedia"
          title="What is known"
          description={`${pluralize(lore.length, "entry", "entries")} across ${byCategory.length} categories.`}
        />

        {lore.length === 0 ? (
          <p className="border-b border-border py-10 text-[13.5px] text-ink-muted">
            Nothing has been catalogued in this universe yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {byCategory.map((group) => (
              <div key={group.category}>
                <h3 className="overline border-b border-border pb-2 text-ink-faint">
                  {group.category} ({group.entries.length})
                </h3>

                <ul className="divide-y divide-border">
                  {group.entries.map((entry) => (
                    <li key={entry.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="type-section text-[16.5px] leading-snug text-ink">
                          {entry.title}
                        </p>
                        <CanonBadge status={entry.canon} />
                      </div>
                      <p className="clamp-2 mt-1 font-reading text-[14px] leading-relaxed text-ink-muted">
                        {entry.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Timeline highlights */}
      {events.length > 0 ? (
        <section className="mt-16">
          <SectionHead
            overline="Chronology"
            title="Timeline"
            description={`${pluralize(events.length, "event", "events")} across ${eras.length} eras.`}
          />

          <ol className="mt-8 max-w-[720px] border-l border-border pl-6">
            {events.map((event) => (
              <li key={event.id} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[25px] top-1.5 size-2 -translate-x-1/2 rotate-45 bg-brass"
                />
                <p className="type-meta text-ink-faint">
                  {event.era} · {event.date}
                </p>
                <h3 className="type-section mt-1 text-[17.5px] text-ink">{event.title}</h3>
                <p className="mt-1 max-w-[58ch] font-reading text-[15px] leading-[1.6] text-ink-muted">
                  {event.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Linked stories */}
      {universe.stories.length > 0 ? (
        <section className="mt-16">
          <SectionHead
            overline="Fiction"
            title="Stories set here"
            description="Published work that takes place in this universe."
          />

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {universe.stories.map((story) => (
              <StoryCard key={story.id} story={story} size="sm" />
            ))}
          </div>
        </section>
      ) : null}

      {/* Linked campaigns — scope note, not fake functionality. */}
      {universe.campaigns.length > 0 ? (
        <section className="mt-16">
          <SectionHead
            overline="Tabletop"
            title="Campaigns in this world"
            description="Game master workspaces that reference this universe."
          />

          <ul className="mt-6 divide-y divide-border border-y border-border">
            {universe.campaigns.map((campaign) => (
              <li key={campaign.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="type-section text-[16.5px] text-ink">{campaign.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">
                    {campaign.system} · {campaign.sessions} sessions · {campaign.status}
                  </p>
                </div>
                <span className="label-box border-border-strong text-ink-faint">Private</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
