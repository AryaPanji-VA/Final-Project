import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
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
// Opening a book is a slow reveal: it starts gently, carries through the
// middle, and only then settles. The exit curve above is deliberately the
// opposite — leaving is quick.
const OPEN_EASE = "cubic-bezier(0.42, 0, 0.24, 1)";

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

  // Momentum and aim. `velocityRef` is books-per-second carried past the last
  // wheel tick — that trailing travel is what gives the scrub weight. `idleRef`
  // is when input last arrived, so the settle knows when to take over.
  const velocityRef = useRef(0);
  const idleRef = useRef(0);
  // Pointer in viewport space, and the eased tilt it drives.
  const pointerRef = useRef({ x: 0, y: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });

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

      // Park the aim at the centre until the pointer says otherwise, so the
      // first frame is not a hard lean to one side.
      pointerRef.current = { x: rect.width / 2, y: rect.height / 2 };
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
      // Aim is tracked everywhere, not only while dragging: the books turn to
      // follow the pointer, and they should start turning as it approaches.
      const rect = viewport.getBoundingClientRect();
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };

      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.x;
      if (Math.abs(dx) > 6) drag.moved = true;
      if (drag.moved) {
        targetRef.current = drag.target - dx / step;
        velocityRef.current = 0; // a drag is direct; momentum would fight it
        idleRef.current = performance.now();
      }
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

    function onPointerLeave() {
      // Park the aim at the centre so the tilt eases back instead of sticking.
      const rect = viewport.getBoundingClientRect();
      pointerRef.current = { x: rect.width / 2, y: rect.height / 2 };
    }

    function onWheel(event) {
      if (isOpen) return;

      // Both axes drive the shelf: a horizontal trackpad swipe stays
      // pixel-accurate, a vertical mouse wheel moves roughly one book per
      // notch. The wheel feeds BOTH the destination and the velocity, so the
      // shelf keeps travelling for a moment after the last tick — that
      // trailing carry is the weight. The idle timer only decides when the
      // destination snaps to a whole book.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const dx = event.deltaX * unit;
      const dy = event.deltaY * unit;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const delta = horizontal ? dx : dy;
      if (delta === 0) return;

      event.preventDefault();
      const amount = delta * (horizontal ? 1 / step : 1 / 150);
      targetRef.current += amount;
      velocityRef.current += amount * 3.2; // books per second of carry
      idleRef.current = performance.now();

      window.clearTimeout(onWheel.timer);
      onWheel.timer = window.setTimeout(() => {
        targetRef.current = Math.round(targetRef.current);
      }, 260);
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointerleave", onPointerLeave);
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

      // Position is a damped spring, not an eased lerp. An eased lerp starts
      // at full speed and slows down, which reads as "light". A spring has to
      // accelerate first, carries momentum past the last wheel tick, and then
      // settles — that lag is the weight. Integrated in fixed sub-steps so a
      // long frame gap cannot blow the spring up.
      if (reducedRef.current) {
        posRef.current = targetRef.current;
        velocityRef.current = 0;
      } else {
        const dragging = dragRef.current?.moved;
        // Stiffness: a drag tracks the finger tightly, a wheel scrub is heavy.
        const stiffness = dragging ? 120 : 26;
        const damping = 2 * Math.sqrt(stiffness); // critical — no bounce

        let remaining = dt;
        while (remaining > 1e-4) {
          const step = Math.min(remaining, 1 / 120);
          remaining -= step;

          velocityRef.current +=
            (targetRef.current - posRef.current) * stiffness * step -
            velocityRef.current * damping * step;
          posRef.current += velocityRef.current * step;
        }

        // Park exactly on the target once both offset and speed are spent.
        if (
          Math.abs(targetRef.current - posRef.current) < 1e-3 &&
          Math.abs(velocityRef.current) < 1e-3
        ) {
          posRef.current = targetRef.current;
          velocityRef.current = 0;
        }
      }

      const s = posRef.current;

      // Aim. The pointer is read against the shelf's own box, so the books
      // follow the cursor wherever it is — not just when it is over the
      // centred book. Two strengths, deliberately gentle: a wider lean while
      // the pointer is over the facing cover, a whisper elsewhere.
      const px = pointerRef.current.x - w / 2;
      const py = pointerRef.current.y - h / 2;
      const overCover = !isOpen && Math.abs(px) < 0.55 * d && Math.abs(py) < 0.6 * h;

      const aimY = overCover
        ? clamp((px / (0.55 * d)) * 6, -6, 6)
        : clamp((px / Math.max(w, 1)) * 4, -4, 4);
      const aimX = overCover ? clamp(-(py / (h / 2)) * 4, -4, 4) : 0;

      const f7 = 1 - Math.exp(-7 * dt);
      tiltRef.current.y += (aimY - tiltRef.current.y) * f7;
      tiltRef.current.x += (aimX - tiltRef.current.x) * f7;
      const tiltY = tiltRef.current.y;
      const tiltX = tiltRef.current.x;

      for (const entry of bookRefs.current) {
        if (!entry) continue;

        const { el, spine, cover, index } = entry;

        // Signed distance from the shelf's resting position, wrapped to the
        // nearest copy so the row never runs out at either end.
        let r = ((index - s) % total + total) % total;
        if (r >= total / 2) r -= total;

        const distance = Math.abs(r);

        // The selected book opens a gap around itself like real books on a
        // shelf: everything past the first slot rides as one rigid block —
        // neighbours keep the normal slot spacing between themselves (the
        // untouched part of the shelf stays untouched), and the whole block
        // shifts just far enough for the facing cover to fit. The selected
        // book glides from the centre to its first pushed slot on a
        // smoothstep, so position and speed both match up with no snap.
        const face = (d + ws) / 2 + 2 * gap; // room the facing cover needs
        const pushMax = Math.max(0, face - step);
        const base = distance < 1
          ? Math.sign(r) * (step + pushMax) * smoothstep(distance)
          : Math.sign(r) * (distance * step + pushMax);
        const x = base;

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

        // The tilt is scaled by `o`, so the book facing the camera leans with
        // the pointer and the spines beside it stay upright — the row reads as
        // one object turning its head, not a wall of tilting cards.
        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateZ(${(-4 * o).toFixed(3)}deg) ` +
          `rotateX(${(tiltX * o).toFixed(3)}deg) ` +
          `rotateY(${(-90 * o + tiltY * o).toFixed(3)}deg)`;
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

    // A slow, deliberate zoom: the sheet has to travel from the cover's own
    // rectangle to full bleed, so it gets nearly a second and an ease-out that
    // front-loads the expansion. Anything faster reads as a page switch rather
    // than a book being opened.
    sheet.animate(
      [
        { clipPath: inset, transform: "rotate(-4deg) scale(0.86)", opacity: 0.35 },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg) scale(1)", opacity: 1 },
      ],
      { duration: reducedRef.current ? 1 : 1150, easing: OPEN_EASE, fill: "both" },
    );

    sheet.querySelector("[data-sheet-body]")?.animate(
      [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
      {
        duration: reducedRef.current ? 1 : 620,
        delay: reducedRef.current ? 0 : 560,
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
        { clipPath: "inset(0px 0px 0px 0px round 0px)", transform: "rotate(0deg) scale(1)", opacity: 1 },
        { clipPath: inset, transform: "rotate(-4deg) scale(0.86)", opacity: 0.35 },
      ],
      { duration: 680, easing: SHEET_EASE, fill: "both" },
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
                "label-box h-8 border font-ui text-[10px] uppercase tracking-[0.12em] transition-colors",
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
                      className="whitespace-nowrap font-reading text-[12.5px] font-medium leading-none tracking-[0.01em]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {story.title}
                    </span>
                    <span
                      className={cn(
                        "absolute bottom-2 font-ui text-[7px] tabular-nums uppercase tracking-[0.1em]",
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
              className="type-section text-[clamp(1.55rem,1.15rem+1.7vw,2.35rem)] leading-[1.12] text-ink"
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

          <span className="label-box border-border-strong font-ui tabular-nums text-ink-muted">
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

      {/* Quick-look sheet, portalled to <body>. Kept mounted so the clip-path
          animation has an element to grow from; hidden from AT while closed.

          The portal is load-bearing: `position: fixed` resolves against the
          nearest ancestor with a transform, filter or clip-path, and
          `.page-enter` keeps a clip-path from its entrance animation
          (`fill: both`). Left in the tree, this sheet would be trapped in that
          ancestor's stacking context and the sticky header (z-40) would paint
          over its top edge no matter what z-index the sheet carries.

          The ground is flat black, not a paper tone: opening a book puts the
          archive away and dims the room, so the only things lit are the cover
          and the page in front of it. */}
      {createPortal(
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          tabIndex={-1}
          className={cn(
            "fixed inset-0 z-[70] overflow-y-auto bg-black focus-visible:outline-none",
            !isOpen && "pointer-events-none invisible",
          )}
        >
          <div
            data-sheet-body
            className="relative mx-auto flex min-h-full w-full max-w-[1180px] flex-col justify-center gap-10 px-6 py-20 sm:px-10"
          >
            {/* Masthead — overline, title and byline span the full measure. The
                old sheet centred everything in two columns, which left 225px of
                dead air above and below the tallest column. */}
            <header className="pb-8">
              <p className="overline text-brass">
                {current.genre} · {current.chapterCount} chapters ·{" "}
                {current.wordCount.toLocaleString("en-GB")} words
              </p>

              <h2 className="type-page mt-3 max-w-[22ch] text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] text-ink">
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
            </header>

            {/* Spread — cover on the left, the reading matter on the right. The
                cover is never hidden: on mobile it sits above the text at a
                smaller size instead of disappearing. */}
            <div className="grid gap-8 sm:grid-cols-[220px_1fr] sm:gap-10 lg:grid-cols-[300px_1fr]">
              <div className="mx-auto w-[150px] shrink-0 sm:mx-0 sm:w-full">
                <StoryCover
                  story={current}
                  size="md"
                  className="shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="min-w-0">
                <p className="max-w-[58ch] text-[15px] leading-[1.7] text-ink-muted">
                  {current.synopsis}
                </p>

                {/* Meta rail — the counts a keeper checks before committing. */}
                <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-4">
                  {[
                    ["Chapters", `${current.chapterCount} of ${current.totalChapters}`],
                    ["Words", current.wordCount.toLocaleString("en-GB")],
                    ["Reads", current.reads.toLocaleString("en-GB")],
                    ["Published", current.publishedAt ? formatDate(current.publishedAt) : "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="overline text-ink-faint">{label}</dt>
                      <dd className="type-num mt-1.5 text-[12.5px] text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Chapter preview — the sheet answers "what is in this book?",
                    not just "what is it about?". Drafts are shown muted, so the
                    count above and the list below always agree. */}
                {current.chapters?.length ? (
                  <div className="mt-8">
                    <p className="overline text-ink-faint">Contents</p>

                    <ol className="mt-3 divide-y divide-border border-y border-border">
                      {current.chapters.slice(0, 4).map((chapter) => {
                        const published = chapter.status === "published";

                        return (
                          <li key={chapter.id}>
                            {published ? (
                              <Link
                                to={`/stories/${current.slug}/read/${chapter.id}`}
                                onClick={closeSheet}
                                className="group flex items-baseline gap-3 py-2.5 transition-colors hover:text-arcane-bright"
                              >
                                <span className="type-num w-6 shrink-0 text-ink-faint">
                                  {String(chapter.index).padStart(2, "0")}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink group-hover:text-arcane-bright">
                                  {chapter.title}
                                </span>
                                <span className="type-num shrink-0 text-[11px] text-ink-faint">
                                  {chapter.words.toLocaleString("en-GB")}
                                </span>
                              </Link>
                            ) : (
                              <div className="flex items-baseline gap-3 py-2.5 opacity-55">
                                <span className="type-num w-6 shrink-0 text-ink-faint">
                                  {String(chapter.index).padStart(2, "0")}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-muted">
                                  {chapter.title}
                                </span>
                                <span className="overline shrink-0 text-[9.5px] text-ink-faint">Draft</span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ) : null}

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
            </div>
          </div>

          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="label-box absolute right-6 top-6 border-border-strong bg-black/80 text-ink-muted backdrop-blur-[2px] transition-colors hover:border-ink hover:text-ink"
          >
            <X className="mr-1.5 inline size-3" aria-hidden="true" />
            Close
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
