import { cn } from "@/lib/utils";

/**
 * StoryCover — a typographic cover, generated from the story's own data.
 *
 * There is no cover art in this build, so the cover is *composed*: a tone
 * field, a hairline rule grid, the title set in Newsreader, and the author's
 * name in micro-caps at the foot. It reads as a designed jacket rather than a
 * placeholder, and it keeps every story visually distinct via `tone`.
 */

const TONES = {
  // Wine plate — the default for fiction.
  wine: {
    bg: "bg-crimson",
    ink: "text-onaccent",
    rule: "bg-onaccent/25",
    meta: "text-onaccent/75",
    badge: "border-onaccent/40 text-onaccent/85",
  },
  // Arcane plate — cold, distant, speculative.
  arcane: {
    bg: "bg-arcane",
    ink: "text-onaccent",
    rule: "bg-onaccent/25",
    meta: "text-onaccent/75",
    badge: "border-onaccent/40 text-onaccent/85",
  },
  // Obsidian plate — the darkest jacket.
  obsidian: {
    bg: "bg-paper-muted",
    ink: "text-ink",
    rule: "bg-ink/15",
    meta: "text-ink-faint",
    badge: "border-ink/30 text-ink-muted",
  },
  // Vellum plate — the one light jacket, used sparingly.
  vellum: {
    bg: "bg-[#d9cfba]",
    ink: "text-[#14151a]",
    rule: "bg-[#14151a]/20",
    meta: "text-[#3a3830]",
    badge: "border-[#14151a]/30 text-[#3a3830]",
  },
  // Brass-quiet plate — archival, worn.
  brass: {
    // Plate #3a2e20 with a foil light enough to clear AA (7.7:1) — brass
    // itself is only 3.7:1 here, which fails for 8px label type.
    bg: "bg-[#3a2e20]",
    ink: "text-ink",
    rule: "bg-[#d8c49a]/25",
    meta: "text-[#d8c49a]",
    badge: "border-[#d8c49a]/40 text-[#d8c49a]",
  },
};

/** Seed data still uses the v2.0 tone names; map them onto the new plates. */
const ALIASES = {
  forest: "wine",
  cobalt: "arcane",
  ink: "obsidian",
  paper: "vellum",
  moss: "brass",
};


export function StoryCover({ story, className, size = "md", children }) {
  const key = TONES[story.tone] ? story.tone : (ALIASES[story.tone] ?? "wine");
  const tone = TONES[key];

  // Type scales with the cover, so the same component works at 56px in a
  // shelf spine and at 420px on a detail page.
  const scale = {
    xs: { title: "text-[11px] leading-[1.15]", pad: "p-2", meta: "text-[6px]", hideMeta: true },
    sm: { title: "text-[15px] leading-[1.15]", pad: "p-3", meta: "text-[7px]", hideMeta: false },
    md: { title: "text-[19px] leading-[1.12]", pad: "p-4", meta: "text-[8px]", hideMeta: false },
    lg: { title: "text-[30px] leading-[1.08]", pad: "p-6", meta: "text-[9px]", hideMeta: false },
    xl: { title: "text-[42px] leading-[1.05]", pad: "p-8", meta: "text-[10px]", hideMeta: false },
  }[size];

  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-[2px]",
        tone.bg,
        tone.ink,
        scale.pad,
        className,
      )}
    >
      {/* Hairline rule grid — cartographic registration marks. */}
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-[26%] h-px", tone.rule)} />
      <span aria-hidden="true" className={cn("absolute inset-x-0 bottom-[26%] h-px", tone.rule)} />
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-[18%] w-px", tone.rule)} />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={cn(
            "border px-1 py-px font-ui text-[6.5px] font-semibold uppercase leading-none tracking-[0.12em]",
            tone.badge,
          )}
        >
          {story.genre ?? "Story"}
        </span>

        {!scale.hideMeta ? (
          <span className={cn("font-ui text-[8px] tabular-nums uppercase tracking-[0.1em]", tone.meta)}>
            {story.id?.replace("st-", "№").toUpperCase()}
          </span>
        ) : null}
      </div>

      {/* The cover's title is set as artwork, not as a document heading: the
          card or page that owns this cover already carries the real heading,
          so an h3 here would duplicate it and break heading order. */}
      <p className={cn("relative font-reading font-medium tracking-[0.005em]", scale.title)}>
        {story.title}
      </p>

      <div className="relative">
        {!scale.hideMeta ? (
          <span
            aria-hidden="true"
            className={cn("mb-2 block h-px w-6", tone.rule.replace("bg-", "bg-"))}
          />
        ) : null}
        <p className={cn("font-ui uppercase leading-none tracking-[0.1em]", scale.meta, tone.meta)}>
          {story.author?.name ?? "Unattributed"}
        </p>
      </div>

      {children}
    </div>
  );
}

/**
 * Resolve a story's `tone` to a plate. Seed data still carries the v2.0 names
 * (forest, cobalt, moss…), so anything that needs the plate — the shelf spine,
 * for instance — must go through this rather than reading TONES directly.
 */
export function resolveTone(tone) {
  const key = TONES[tone] ? tone : (ALIASES[tone] ?? "wine");
  return { key, ...TONES[key] };
}

export { TONES as coverTones };
