import { cn } from "@/lib/utils";

/**
 * StatRow — editorial figures: a Newsreader number over an overline label,
 * separated by rules. Never a KPI tile (§1.2).
 *
 * The figures are brass: on an obsidian ground they read as engraved plate
 * numbers rather than dashboard metrics.
 */
export function StatRow({ children, className, columns = 3 }) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto border-y border-border px-5 md:mx-0 md:grid md:overflow-visible md:px-0",
        columns === 4 ? "md:grid-cols-4" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({ value, label, note, className }) {
  return (
    <div
      className={cn(
        "min-w-[130px] shrink-0 snap-start border-l border-border px-5 py-5 first:border-l-0 first:pl-0",
        "md:min-w-0 md:shrink",
        className,
      )}
    >
      <p className="font-serif text-[clamp(1.5rem,1.2rem+1vw,2.125rem)] leading-none tracking-[-0.02em] text-brass">
        {value}
      </p>

      <p className="overline mt-2.5 text-ink-faint">{label}</p>

      {note ? <p className="mt-1.5 text-[12px] text-ink-muted">{note}</p> : null}
    </div>
  );
}
