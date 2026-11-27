import { Link } from "react-router";

import { cn } from "@/lib/utils";

/**
 * SectionHead — the editorial section divider (§1.2).
 *
 * Overline in brass, a Cormorant title, an optional standfirst and action,
 * sitting above a hairline with a brass tick at its centre. The tick is the
 * page's one ornament; it is what makes a run of sections read as a printed
 * sequence rather than a stack of blocks.
 */
export function SectionHead({
  overline,
  title,
  description,
  action,
  className,
  rule = true,
  ornament = true,
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="min-w-0">
        {overline ? <p className="overline text-brass">{overline}</p> : null}

        {title ? (
          <h2 className="type-section mt-2.5 text-[clamp(1.3rem,1.08rem+0.8vw,1.85rem)] text-ink">
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className="mt-2 max-w-[64ch] text-[13.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}

      {rule ? (
        ornament ? (
          <div aria-hidden="true" className="rule-ornament mt-1 w-full" />
        ) : (
          <div aria-hidden="true" className="mt-1 h-px w-full bg-border" />
        )
      ) : null}
    </div>
  );
}

/**
 * EditorialHeader — the masthead for public pages (§7.1).
 *
 * A display statement, a standfirst, a meta row and optional actions, set over
 * an ink wash so the top of a public page is the one lit place on it. The
 * composition is a publication cover, not a SaaS banner.
 */
export function EditorialHeader({
  overline,
  title,
  standfirst,
  actions,
  meta,
  align = "left",
  className,
  children,
}) {
  const centred = align === "center";

  return (
    <header
      className={cn(
        "ink-wash border-b border-border pb-9 pt-14 sm:pb-12 sm:pt-20",
        centred && "text-center",
        className,
      )}
    >
      {overline ? (
        <p className={cn("overline text-brass", centred && "flex justify-center")}>{overline}</p>
      ) : null}

      <h1
        className={cn(
          "type-page mt-4 text-ink",
          "text-[clamp(2.25rem,1.3rem+3.6vw,4.25rem)]",
          centred ? "mx-auto max-w-[20ch]" : "max-w-[22ch]",
        )}
      >
        {title}
      </h1>

      {standfirst ? (
        <p
          className={cn(
            "mt-5 max-w-[56ch] text-[15px] leading-[1.7] text-ink-muted sm:text-[16px]",
            centred && "mx-auto",
          )}
        >
          {standfirst}
        </p>
      ) : null}

      {meta ? (
        <div
          className={cn(
            "type-meta mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-faint",
            centred && "justify-center",
          )}
        >
          {meta}
        </div>
      ) : null}

      {actions ? (
        <div className={cn("mt-7 flex flex-wrap items-center gap-3", centred && "justify-center")}>
          {actions}
        </div>
      ) : null}

      {children}
    </header>
  );
}

/** Inline editorial link, arcane with a hover underline. */
export function EditorialLink({ to, children, className, ...props }) {
  return (
    <Link
      to={to}
      className={cn(
        "text-arcane-bright underline-offset-4 transition-colors hover:underline",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

/** "See all →" link used at the end of a collection. */
export function MoreLink({ to, children = "See all", className }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-arcane-bright sm:min-h-0",
        className,
      )}
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
