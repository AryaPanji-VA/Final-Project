import { NavLink } from "react-router";
import { BookMarked } from "lucide-react";

/**
 * AuthLayout — the archive's door (§7.14).
 *
 * Left: a wine-dark masthead with a survey rule grid, a display statement, and
 * an epigraph under a brass rule — the mood of the product before the form asks
 * for anything. Right: the form, set as a title page. Below lg the panel is
 * dropped and the form takes the full width.
 */
export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-crimson/30 bg-parchment p-12 lg:flex xl:p-16">
        {/* Survey grid — the same rule geometry as a universe plate. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-[28%] w-px bg-brass/15" />
        <span aria-hidden="true" className="absolute inset-y-0 left-[72%] w-px bg-brass/15" />
        <span aria-hidden="true" className="absolute inset-x-0 top-[32%] h-px bg-brass/15" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-[24%] h-px bg-brass/15" />

        {/* One soft bloom, so the panel is lit from the top-left. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 22% 8%, rgba(112,45,59,0.5) 0%, transparent 70%)",
          }}
        />

        <NavLink to="/" className="relative flex items-center gap-2.5">
          <BookMarked className="size-[18px] text-brass" aria-hidden="true" />
          <span className="type-display text-[17.5px] text-ink">Lorekeeper</span>
        </NavLink>

        <div className="relative max-w-[46ch]">
          <p className="overline text-brass">The archive of imagined worlds</p>

          <p className="type-display mt-5 text-[clamp(1.9rem,1.45rem+1.9vw,2.7rem)]">
            Every world has a story. Every story has a place.
          </p>

          <p className="mt-5 text-[15px] leading-[1.7] text-ink-muted">
            Write serialised fiction, build the worlds behind it, and keep the campaigns that
            happen inside them — all in one archive.
          </p>

          <blockquote className="mt-8 border-l-2 border-brass pl-5">
            <p className="font-reading text-[17px] italic leading-relaxed text-ink-muted">
              “Between the pages of an unwritten story, a world is already waiting to be found.”
            </p>
          </blockquote>
        </div>

        <p className="overline relative text-ink-faint">Lorekeeper — est. 2026</p>
      </section>

      <section className="flex min-h-dvh flex-col items-center justify-center px-5 py-12 sm:px-8">
        <NavLink to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <BookMarked className="size-[18px] text-brass" aria-hidden="true" />
          <span className="type-display text-[17.5px] text-ink">Lorekeeper</span>
        </NavLink>

        <div className="w-full max-w-[400px]">{children}</div>

        <p className="overline mt-10 text-ink-faint">Lorekeeper © 2026</p>
      </section>
    </div>
  );
}
