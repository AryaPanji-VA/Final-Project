import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { resolveTone, StoryCover } from "@/components/shared/story-cover";

/**
 * BookShelf — the signature interaction (§8.3 A + B, revised).
 *
 * A row of books stands spine-out on a shelf, in perspective. The selected
 * book is pulled forward, turned to face the reader and lifted; its neighbours
 * stay edge-on so only their spines are visible. Dragging, the arrow keys, the
 * genre tabs or a horizontal trackpad swipe all scrub the shelf; the caption
 * below mask-slides to whichever book comes to rest in the middle. Clicking
 * the resting book opens a quick-look sheet that expands out of the cover's
 * own rectangle, and from there the reader goes to the story route.
 *
 * React notes (this is the part worth reading):
 * - Discrete state (`activeIndex`, `metrics`, `isOpen`) lives in `useState`.
 * - Continuous motion lives in refs and one requestAnimationFrame loop. The
 *   loop writes transforms straight to the DOM, so a 60fps scrub costs zero
 *   renders. Never `setState` per frame.
 * - Geometry is measured, not guessed: a ResizeObserver writes the real
 *   height/width into state, and every offset is derived from it.
 * - Every listener added in an effect is removed in that effect's cleanup.
 */

/* ---------------- geometry ---------------- */

// Ratios, not pixels: the shelf is sized from its own measured height, so the
// same numbers hold at 390px and at 1440px.
const RATIO = {
  thickness: 0.115, // spine width
  depth: 0.64, // cover width
  gap: 0.03,
};

const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
const smoothstep = (x) => x * x * (3 - 2 * x);

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const SHEET_EASE = "cubic-bezier(0.76, 0, 0.18, 1)";

/* ---------------- shelf ---------------- */

export function BookShelf({ stories, className }) {
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, stories.findIndex((story) => story.featured)),
  );
  const [metrics, setMetrics] = useState({ height: 320, width: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const viewportRef = useRef(null);
  const stageRef = useRef(null);
  const bookRefs = useRef([]); // one entry per rendered book copy
  const targetRef = useRef(activeIndex); // where the shelf is heading
  const posRef = useRef(activeIndex); // where the shelf actually is
  const hoverRef = useRef(-1); // hovered book (virtual index)
  const restingRef = useRef(activeIndex); // last index reported to React
  const dragRef = useRef(null);
  const reducedRef = useRef(false);

  const count = stories.length;
  const copies = 3; // a book can be visible on both sides of the loop
  const total = count * copies;

  const book = stories[activeIndex] ?? null;

  /* Genre tabs, derived from the data rather than hand-written. */
  const genres = useMemo(() => {
    const firstIndex = new Map();
    stories.forEach((story, index) => {
      if (story.genre && !firstIndex.has(story.genre)) firstIndex.set(story.genre, index);
    });
    return [...firstIndex.entries()].map(([name, index]) => ({ name, index }));
  }, [stories]);

  /* ---------------- measurement ---------------- */

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || count === 0) return undefined;

    function measure() {
      const rect = viewport.getBoundingClientRect();
      // A book is 86% of the shelf's height. The remaining 14% is headroom for
      // the resting book's 4° tilt and the hovered book's 5% lift — without it
      // the corner of the facing cover clips at the top of the viewport.
      setMetrics({ height: rect.height * 0.86, width: rect.width });
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [count]);

  /* Reduced motion is read once and kept live. */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = query.matches;

    function onChange(event) {
      reducedRef.current = event.matches;
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const { height: h, width: w } = metrics;
  const ws = h * RATIO.thickness;
  const d = h * RATIO.depth;
  const gap = h * RATIO.gap;
  const step = ws + gap;

  /* ---------------- selection ---------------- */

  const move = useCallback((delta) => {
    targetRef.current = Math.round(targetRef.current) + delta;
  }, []);

  const jumpTo = useCallback((index) => {
    // Take the shortest way round the loop, so a jump never spins past six books.
    const base = Math.round(targetRef.current);
    const current = ((base % count) + count) % count;
    let delta = (((index - current) % count) + count) % count;
    if (delta > count / 2) delta -= count;
    targetRef.current = base + delta;
  }, [count]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape" && isOpen) return; // the sheet handles its own Escape
      if (isOpen) return;

      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, move]);

  /* ---------------- drag + wheel ---------------- */

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    function onPointerDown(event) {
      if (isOpen) return;
      dragRef.current = { x: event.clientX, target: targetRef.current, moved: false };
    }

    function onPointerMove(event) {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.x;
      if (Math.abs(dx) > 6) drag.moved = true;
      if (drag.moved) targetRef.current = drag.target - dx / step;
    }

    function onPointerUp() {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.moved) {
        targetRef.current = Math.round(targetRef.current);
        // The click that ends a drag must not also open the sheet.
        dragRef.current = { ...drag, moved: true, releasedAt: performance.now() };
        window.setTimeout(() => {
          if (dragRef.current?.releasedAt) dragRef.current = null;
        }, 80);
        return;
      }

      dragRef.current = null;
    }

    function onWheel(event) {
      if (isOpen) return;
      // Only horizontal intent scrubs the shelf. A vertical scroll belongs to
      // the page — hijacking it is the thing every bad carousel does.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

      event.preventDefault();
      targetRef.current += event.deltaX / step;
      window.clearTimeout(onWheel.timer);
      onWheel.timer = window.setTimeout(() => {
        targetRef.current = Math.round(targetRef.current);
      }, 160);
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("wheel", onWheel);
      window.clearTimeout(onWheel.timer);
    };
  }, [isOpen, step]);

  /* ---------------- the frame loop ---------------- */

  useEffect(() => {
    if (count === 0) return undefined;

    let frame = 0;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min(50, now - last) / 1000;
      last = now;

      // Position eases toward the target; under reduced motion it just snaps.
      if (reducedRef.current) {
        posRef.current = targetRef.current;
      } else {
        const k = dragRef.current?.moved ? 16 : 5.4;
        posRef.current += (targetRef.current - posRef.current) * (1 - Math.exp(-k * dt));
        if (Math.abs(targetRef.current - posRef.current) < 1e-4) {
          posRef.current = targetRef.current;
        }
      }

      const s = posRef.current;

      for (const entry of bookRefs.current) {
        if (!entry) continue;

        const { el, spine, cover, index } = entry;

        // Signed distance from the shelf's resting position, wrapped to the
        // nearest copy so the row never runs out at either end.
        let r = ((index - s) % total + total) % total;
        if (r >= total / 2) r -= total;

        const distance = Math.abs(r);
        const x = r * step + (d - ws + 1.6 * gap) * (distance < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * 0.5);

        // Cull just past the shelf edge. Overflow clipping is unreliable inside
        // a preserve-3d subtree, so books must be hidden explicitly or a spine
        // pokes out and widens the page on narrow screens.
        if (Math.abs(x) > w / 2 + 0.55 * d) {
          if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
          continue;
        }
        if (el.style.visibility === "hidden") el.style.visibility = "visible";

        // o = 1 at the centre, 0 a book away: it turns the book from spine-out
        // to face-out, and lifts it clear of its neighbours.
        const o = smoothstep(clamp(1 - distance, 0, 1));
        const lift = hoverRef.current === index && distance > 0.5 && !isOpen ? 1 : 0;
        const eased = reducedRef.current ? lift : (entry.lift ?? 0) + (lift - (entry.lift ?? 0)) * (1 - Math.exp(-12 * dt));
        entry.lift = eased;

        const y = -o * 0.03 * h - eased * 0.05 * h;
        const z = o * 0.2 * h;

        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateZ(${(-4 * o).toFixed(3)}deg) rotateY(${(-90 * o).toFixed(3)}deg)`;
        el.style.zIndex = String(Math.round(100 - distance * 4));

        // The face that points at the camera is the one that gets the light.
        spine.style.setProperty("--shade", (o * 0.55).toFixed(3));
        cover.style.setProperty("--shade", ((1 - o) * 0.5).toFixed(3));
      }

      // Which book is resting in the middle? Compare against a ref so the loop
      // only calls setState when the answer actually changes — a render per
      // frame would defeat the point of writing transforms straight to the DOM.
      const resting = ((Math.round(s) % count) + count) % count;
      if (resting !== restingRef.current) {
        restingRef.current = resting;
        setActiveIndex(resting);
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame((now) => {
      last = now;
      tick(now);
    });

    return () => cancelAnimationFrame(frame);
  }, [count, total, step, d, ws, gap, h, w, isOpen]);

  /* ---------------- quick look ---------------- */

  const sheetRef = useRef(null);
  const activeCoverRef = useRef(null);

  function coverRect() {
    const el = activeCoverRef.current;
    if (!el) return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
    return el.getBoundingClientRect();
  }

  function openSheet() {
    const rect = coverRect();
    const sheet = sheetRef.current;
    if (!sheet || !book) return;

    setIsOpen(true);

    const inset = `inset(${rect.top}px ${Math.max(0, window.innerWidth - rect.right)}px ${
      Math.max(0, window.innerHeight - rect.bottom)
    }px ${Math.max(0, rect.left)}px round 3px)`;

    sheet.animate(
      [
        { clipPath: inset, transform: "rotate(-4deg)" },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg)" },
      ],
      { duration: reducedRef.current ? 1 : 620, easing: SHEET_EASE, fill: "both" },
    );

    sheet.querySelector("[data-sheet-body]")?.animate(
      [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
      {
        duration: reducedRef.current ? 1 : 420,
        delay: reducedRef.current ? 0 : 260,
        easing: EASE,
        fill: "both",
      },
    );

    sheet.focus({ preventScroll: true });
  }

  function closeSheet() {
    const sheet = sheetRef.current;

    if (!sheet || reducedRef.current) {
      setIsOpen(false);
      return;
    }

    const rect = coverRect();
    const inset = `inset(${rect.top}px ${Math.max(0, window.innerWidth - rect.right)}px ${
      Math.max(0, window.innerHeight - rect.bottom)
    }px ${Math.max(0, rect.left)}px round 3px)`;

    const animation = sheet.animate(
      [
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg)" },
        { clipPath: inset, transform: "rotate(-4deg)" },
      ],
      { duration: 420, easing: SHEET_EASE, fill: "both" },
    );

    animation.onfinish = () => setIsOpen(false);
  }

  // Page scroll is locked while the sheet is up. Effects own document writes:
  // a handler must not touch it, and the cleanup restores scrolling even if the
  // component unmounts with the sheet open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  /* ---------------- pointer affordances ---------------- */

  function onBookClick(event, entry) {
    if (dragRef.current?.moved) {
      event.preventDefault();
      return;
    }

    const r = ((entry.index - posRef.current) % total + total) % total;
    const wrapped = r >= total / 2 ? r - total : r;

    if (Math.abs(wrapped) < 0.5) openSheet();
    else targetRef.current = Math.round(targetRef.current + wrapped);
  }

  const current = book;

  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured books"
      className={cn("select-none", className)}
    >
      {/* Genre tabs: a printed index row. On narrow screens it becomes a
          horizontal rail — five long genre names never fit 390px, and a rail
          scrolls instead of widening the page. */}
      <div className="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto border-y border-border px-4 py-2 sm:mx-0 sm:justify-center sm:px-0">
        {genres.map((genre) => {
          const isActive = current.genre === genre.name;

          return (
            <button
              key={genre.name}
              type="button"
              onClick={() => jumpTo(genre.index)}
              aria-pressed={isActive}
              className={cn(
                "label-box h-8 border font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                isActive
                  ? "border-brass/60 bg-brass/10 text-brass"
                  : "border-transparent text-ink-faint hover:border-border-strong hover:text-ink",
              )}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      <div
        ref={viewportRef}
        role="group"
        aria-label="Book shelf"
        tabIndex={0}
        className="relative mt-6 h-[clamp(240px,30vw,360px)] touch-pan-y overflow-x-clip [perspective:2200px] [perspective-origin:50%_50%] focus-visible:outline-none"
      >
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 size-0 [transform-style:preserve-3d]"
        >
          {Array.from({ length: total }, (_, index) => {
            const story = stories[index % count];
            const isResting = index % count === activeIndex;
            const tone = resolveTone(story.tone);

            return (
              <div
                key={`${story.id}-${index}`}
                ref={(el) => {
                  if (!el) return;
                  bookRefs.current[index] = {
                    el,
                    spine: el.querySelector("[data-spine]"),
                    cover: el.querySelector("[data-cover-face]"),
                    index,
                    lift: 0,
                  };
                }}
                className="absolute left-0 top-0 size-0 [transform-style:preserve-3d] [will-change:transform]"
              >
                <button
                  type="button"
                  onClick={(event) =>
                    onBookClick(event, { index, story })
                  }
                  onPointerEnter={() => {
                    hoverRef.current = index;
                  }}
                  onPointerLeave={() => {
                    if (hoverRef.current === index) hoverRef.current = -1;
                  }}
                  aria-label={`${story.title} by ${story.author?.name ?? "unknown"}${
                    isResting ? " (selected)" : ""
                  }`}
                  aria-current={isResting ? "true" : undefined}
                  className="group absolute left-0 top-0 block cursor-pointer focus-visible:outline-none"
                  style={{ width: 0, height: 0, transformStyle: "preserve-3d" }}
                >
                  {/* Spine — what the shelf shows edge-on. */}
                  <span
                    data-spine
                    className={cn(
                      "absolute flex items-center justify-center overflow-hidden rounded-[2px]",
                      tone.bg,
                      tone.ink,
                    )}
                    style={{
                      width: `${ws}px`,
                      height: `${h}px`,
                      left: `${-ws / 2}px`,
                      top: `${-h / 2}px`,
                      transform: `translateZ(${d / 2}px)`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("absolute inset-x-0 top-0 h-px", tone.rule)}
                    />
                    <span
                      className="whitespace-nowrap font-serif text-[12px] leading-none tracking-[0.02em]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {story.title}
                    </span>
                    <span
                      className={cn(
                        "absolute bottom-2 font-mono text-[7px] uppercase tracking-[0.1em]",
                        tone.meta,
                      )}
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {(story.publishedAt ?? "").slice(0, 4)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-black"
                      style={{ opacity: "var(--shade, 0)" }}
                    />
                  </span>

                  {/* Cover — what the shelf shows face-on. */}
                  <span
                    data-cover-face
                    className="absolute block overflow-hidden rounded-[2px] shadow-[0_26px_44px_-26px_rgba(0,0,0,0.75)]"
                    style={{
                      width: `${d}px`,
                      height: `${h}px`,
                      left: `${-d / 2}px`,
                      top: `${-h / 2}px`,
                      transform: `rotateY(90deg) translateZ(${ws / 2}px)`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <StoryCover story={story} size="sm" className="h-full w-full" />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-black"
                      style={{ opacity: "var(--shade, 0)" }}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* The book that is resting here — used as the sheet's origin. */}
        <span
          ref={activeCoverRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${d}px`, height: `${h}px` }}
        />
      </div>

      {/* Caption — mask-slides when the resting book changes. */}
      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mask-line" aria-live="polite">
            <p key={`${current.id}-genre`} className="overline text-brass">
              {current.genre} · {current.chapterCount} chapters
            </p>
          </div>

          <div className="mask-line mt-2">
            <h2
              key={`${current.id}-title`}
              className="font-serif text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] tracking-[-0.015em] text-ink"
            >
              <Link to={`/stories/${current.slug}`} className="hover:text-arcane-bright">
                {current.title}
              </Link>
            </h2>
          </div>

          <div className="mask-line mt-2">
            <p key={`${current.id}-by`} className="text-[13px] text-ink-muted">
              by{" "}
              <Link
                to={`/creators/${current.author?.handle}`}
                className="text-ink underline-offset-4 hover:text-arcane-bright hover:underline"
              >
                {current.author?.name}
              </Link>
              <span aria-hidden="true" className="mx-2 text-ink-faint">
                ·
              </span>
              <span className="clamp-2 inline align-bottom sm:max-w-[52ch]">
                {current.synopsis}
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous book"
            className="flex size-11 items-center justify-center rounded-[3px] border border-border-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper sm:size-9"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>

          <span className="label-box border-border-strong font-mono text-ink-muted">
            {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>

          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next book"
            className="flex size-11 items-center justify-center rounded-[3px] border border-border-strong text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper sm:size-9"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={openSheet}
            className="ml-1 inline-flex h-11 items-center gap-2 rounded-[3px] bg-crimson px-4 text-[13px] font-medium text-onaccent transition-colors hover:bg-crimson-deep sm:h-9"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Open
          </button>
        </div>
      </div>

      {/* Quick-look sheet. Kept mounted so the clip-path animation has an
          element to grow from; hidden from AT while closed. */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[70] bg-surface focus-visible:outline-none",
          !isOpen && "pointer-events-none invisible",
        )}
      >
        <div
          data-sheet-body
          className="mx-auto grid h-full max-w-[1180px] content-center gap-10 px-6 py-20 sm:grid-cols-[1fr_300px] sm:items-center sm:px-10"
        >
          <div className="min-w-0">
            <p className="overline text-brass">
              {current.genre} · {current.chapterCount} chapters ·{" "}
              {current.wordCount.toLocaleString("en-GB")} words
            </p>

            <h2 className="mt-3 font-serif text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] leading-[1.04] tracking-[-0.025em] text-ink">
              {current.title}
            </h2>

            <p className="mt-4 text-[13px] text-ink-muted">
              by{" "}
              <Link
                to={`/creators/${current.author?.handle}`}
                className="text-ink underline-offset-4 hover:text-arcane-bright hover:underline"
              >
                {current.author?.name}
              </Link>
              {current.universe ? (
                <>
                  <span aria-hidden="true" className="mx-2 text-ink-faint">
                    ·
                  </span>
                  <span>{current.universe.name}</span>
                </>
              ) : null}
            </p>

            <p className="mt-6 max-w-[58ch] text-[15px] leading-[1.7] text-ink-muted">
              {current.synopsis}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  closeSheet();
                  navigate(`/stories/${current.slug}`);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-crimson px-5 text-[13px] font-medium text-onaccent transition-colors hover:bg-crimson-deep"
              >
                <BookOpen className="size-4" aria-hidden="true" />
                Read the story
              </button>

              <button
                type="button"
                onClick={closeSheet}
                className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-border-strong px-4 text-[13px] text-ink transition-colors hover:border-ink"
              >
                Back to the shelf
              </button>
            </div>
          </div>

          <div className="hidden w-[300px] sm:block">
            <StoryCover story={current} size="md" className="shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        <button
          type="button"
          onClick={closeSheet}
          aria-label="Close"
          className="label-box absolute left-6 top-6 border-border-strong text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <X className="mr-1.5 inline size-3" aria-hidden="true" />
          Close
        </button>
      </div>
    </section>
  );
}
