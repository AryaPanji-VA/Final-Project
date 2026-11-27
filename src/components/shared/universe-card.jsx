import { Link } from "react-router";
import { Lock } from "lucide-react";

import { cn, formatRelativeDate, getInitials, pluralize } from "@/lib/utils";
import { GenreTag } from "@/components/ui/badge";

/**
 * UniverseCover — a cartographic plate. No photography exists for these
 * worlds, so the cover is drawn: a tone field, a rule grid, an oversized
 * initial, and the genre stamped in the corner. Designed, not a placeholder.
 */
export function UniverseCover({ universe, className, children }) {
  return (
    <div
      className={cn(
        "relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-paper-muted",
        className,
      )}
    >
      {/* Survey grid: two verticals, one horizontal, offset — reads as a plate. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-[22%] w-px bg-ink/10" />
      <span aria-hidden="true" className="absolute inset-y-0 left-[63%] w-px bg-ink/10" />
      <span aria-hidden="true" className="absolute inset-x-0 top-[38%] h-px bg-ink/10" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-[22%] h-px bg-ink/10" />

      {/* Ornament, not content: the card's heading carries the world's name. */}
      <span
        aria-hidden="true"
        className="type-display relative text-[clamp(1.9rem,1.2rem+2.6vw,3.15rem)] leading-none text-crimson-bright/30"
      >
        {getInitials(universe.name)}
      </span>

      <span className="absolute left-3 top-3 border border-ink/25 px-1.5 py-0.5 font-ui text-[9px] font-semibold uppercase leading-none tracking-[0.12em] text-ink/70">
        {universe.genre}
      </span>

      {universe.visibility === "private" ? (
        <span
          className="absolute right-3 top-3 flex items-center gap-1 border border-ink/25 bg-paper/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-[0.1em] text-ink/70"
          title="Private universe"
        >
          <Lock className="size-2.5" aria-hidden="true" />
          Private
        </span>
      ) : null}

      {children}
    </div>
  );
}

/**
 * UniverseCard — cover plate, title, description, folio meta. No drop shadow
 * and no lift; the border darkens and the plate rules warm instead.
 */
export function UniverseCard({ universe, className, showCreator = false, meta = "updated" }) {
  const metaText =
    meta === "opened"
      ? `Opened ${formatRelativeDate(universe.openedAt)}`
      : `Updated ${formatRelativeDate(universe.updatedAt)}`;

  return (
    <article className={cn("group", className)}>
      <Link
        to={`/universes/${universe.id}`}
        className="block border border-border transition-colors duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      >
        <UniverseCover universe={universe} />

        <div className="p-4">
          <h3 className="type-display text-[16px] leading-[1.35] text-ink group-hover:text-arcane-bright">
            {universe.name}
          </h3>

          <p className="clamp-2 mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {universe.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-faint">
            <span>{pluralize(universe.entries, "entry", "entries")}</span>
            <span aria-hidden="true">·</span>
            <span>{universe.events} events</span>
            <span aria-hidden="true">·</span>
            <span>{metaText}</span>
          </div>
        </div>
      </Link>

      {showCreator && universe.creator ? (
        <p className="mt-2 text-[12px] text-ink-faint">
          by{" "}
          <Link
            to={`/creators/${universe.creator.handle}`}
            className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {universe.creator.name}
          </Link>
        </p>
      ) : null}
    </article>
  );
}

/** Compact universe row for sidebars and cross-links. */
export function UniverseRow({ universe, className }) {
  return (
    <Link
      to={`/universes/${universe.id}`}
      className={cn(
        "group flex items-start gap-3 py-3 transition-colors",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center border border-border font-ui font-semibold text-[13px] text-crimson transition-colors group-hover:border-ink">
        {getInitials(universe.name)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block type-display text-[14.5px] leading-tight text-ink group-hover:text-arcane-bright">
          {universe.name}
        </span>
        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
          {universe.genre} · {pluralize(universe.entries, "entry", "entries")}
        </span>
      </span>
    </Link>
  );
}

export { GenreTag };
