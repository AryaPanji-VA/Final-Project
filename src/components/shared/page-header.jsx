import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * PageHeader — workspace pages (§7).
 *
 * Overline in brass → serif H1 at 400 + actions → standfirst, closed by a
 * hairline with a brass tick. The tick is the archive's section mark: it
 * appears at the top of a workspace page and nowhere else on it.
 */
export function PageHeader({ overline, title, description, actions, backTo, backLabel, className }) {
  return (
    <header className={cn("mb-8 border-b border-border pb-6", className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="-ml-1 mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-[2px] px-1 text-[13px] text-ink-muted transition-colors hover:text-ink sm:mb-4 sm:min-h-0 sm:px-0"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {backLabel ?? "Back"}
        </Link>
      ) : null}

      {overline ? <p className="overline mb-2 text-brass">{overline}</p> : null}

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="font-serif text-[clamp(1.6rem,1.2rem+1.2vw,2.25rem)] leading-[1.14] tracking-[-0.02em] text-ink">
            {title}
          </h1>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.65] text-ink-muted">{description}</p>
      ) : null}
    </header>
  );
}
