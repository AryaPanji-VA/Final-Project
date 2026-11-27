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
    motif: "text-onaccent/[0.18]",
  },
  // Arcane plate — cold, distant, speculative.
  arcane: {
    bg: "bg-arcane",
    ink: "text-onaccent",
    rule: "bg-onaccent/25",
    meta: "text-onaccent/75",
    badge: "border-onaccent/40 text-onaccent/85",
    motif: "text-onaccent/[0.16]",
  },
  // Obsidian plate — the darkest jacket.
  obsidian: {
    bg: "bg-paper-muted",
    ink: "text-ink",
    rule: "bg-ink/15",
    meta: "text-ink-faint",
    badge: "border-ink/30 text-ink-muted",
    motif: "text-ink/[0.13]",
  },
  // Vellum plate — the one light jacket, used sparingly.
  vellum: {
    bg: "bg-[#d9cfba]",
    ink: "text-[#14151a]",
    rule: "bg-[#14151a]/20",
    meta: "text-[#3a3830]",
    badge: "border-[#14151a]/30 text-[#3a3830]",
    motif: "text-[#14151a]/[0.14]",
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
    motif: "text-[#d8c49a]/[0.17]",
  },
};

/* ---------------- cover motif ----------------
 *
 * A cartographic plate, drawn from the story's own id. No asset, no image
 * request, and the same book always gets the same plate — the drawing is a
 * property of the work, not of the render.
 *
 * Three devices, chosen by genre, because the shelf should say something about
 * the kind of book before you read a word of it:
 *   topography — nested contours around one or two summits (fantasy, historical)
 *   orbit      — near-perfect concentric rings with a crosshair (science fiction)
 *   grid       — stepped rectangles, a city seen from above (urban fantasy)
 *
 * Everything is stroked in `currentColor` at low alpha, so the motif inherits
 * the plate's own ink and can never fight the title sitting on top of it.
 */

const MOTIF_VIEW = { w: 100, h: 150 };

/** FNV-1a: a stable 32-bit seed from a string. */
function seedFrom(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — small deterministic PRNG, so a seed always yields one plate. */
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One closed contour: a circle whose radius is bent by shared harmonics. Every
 * ring in a plate uses the same harmonics, so the wobbles line up and the rings
 * nest like real elevation lines instead of drifting apart.
 */
function contourPath(cx, cy, radius, harmonics, squash) {
  const steps = 72;
  let path = "";

  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    let r = radius;
    for (const harmonic of harmonics) {
      r += Math.sin(t * harmonic.freq + harmonic.phase) * harmonic.amp * radius;
    }
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r * squash;
    path += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  return `${path}Z`;
}

function topographyPaths(random) {
  const harmonics = [
    { freq: 2, phase: random() * Math.PI * 2, amp: 0.09 + random() * 0.05 },
    { freq: 3, phase: random() * Math.PI * 2, amp: 0.04 + random() * 0.035 },
    { freq: 5, phase: random() * Math.PI * 2, amp: 0.015 + random() * 0.025 },
  ];

  const summits = 1 + Math.floor(random() * 2);
  const paths = [];

  for (let summit = 0; summit < summits; summit += 1) {
    const cx = 24 + random() * 52;
    const cy = 34 + random() * 82;
    const rings = 4 + Math.floor(random() * 3);
    const spacing = 6 + random() * 5;
    const squash = 0.8 + random() * 0.14;

    for (let ring = 1; ring <= rings; ring += 1) {
      paths.push(contourPath(cx, cy, ring * spacing, harmonics, squash));
    }
  }

  return paths;
}

function orbitPaths(random) {
  const cx = 50 + (random() - 0.5) * 16;
  const cy = 66 + (random() - 0.5) * 44;
  const rings = 5 + Math.floor(random() * 3);
  const spacing = 7 + random() * 6;
  // A hair of wobble only: an orbit should read as machined, not organic.
  const harmonics = [{ freq: 1, phase: random() * Math.PI * 2, amp: 0.008 }];

  const paths = [];
  for (let ring = 1; ring <= rings; ring += 1) {
    paths.push(contourPath(cx, cy, ring * spacing, harmonics, 1));
  }

  // Crosshair through the centre — the instrument mark on a star chart.
  const arm = rings * spacing + 6;
  paths.push(
    `M${(cx - arm).toFixed(2)} ${cy.toFixed(2)}H${(cx + arm).toFixed(2)}`,
    `M${cx.toFixed(2)} ${(cy - arm).toFixed(2)}V${(cy + arm).toFixed(2)}`,
  );

  return paths;
}

function gridPaths(random) {
  const cx = 50 + (random() - 0.5) * 10;
  const cy = 74 + (random() - 0.5) * 30;
  const rings = 4 + Math.floor(random() * 3);

  let halfWidth = 11 + random() * 7;
  const paths = [];

  for (let ring = 1; ring <= rings; ring += 1) {
    const halfHeight = halfWidth * (1.05 + random() * 0.45);
    paths.push(
      `M${(cx - halfWidth).toFixed(2)} ${(cy - halfHeight).toFixed(2)}` +
        `H${(cx + halfWidth).toFixed(2)}V${(cy + halfHeight).toFixed(2)}` +
        `H${(cx - halfWidth).toFixed(2)}Z`,
    );
    halfWidth += 6 + random() * 6;
  }

  return paths;
}

function CoverMotif({ story, tone }) {
  const seed = seedFrom(story.id ?? story.slug ?? story.title ?? "lorekeeper");
  const genre = (story.genre ?? "").toLowerCase();

  let variant = "topography";
  if (genre.includes("science")) variant = "orbit";
  else if (genre.includes("urban")) variant = "grid";

  const random = seededRandom(seed);
  const paths =
    variant === "orbit"
      ? orbitPaths(random)
      : variant === "grid"
        ? gridPaths(random)
        : topographyPaths(random);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${MOTIF_VIEW.w} ${MOTIF_VIEW.h}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", tone.motif)}
    >
      {paths.map((d, index) => (
        <path
          key={index}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.5}
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

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

      {/* The plate's device. Sits under the type, inherits the plate's ink. */}
      <CoverMotif story={story} tone={tone} />

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
