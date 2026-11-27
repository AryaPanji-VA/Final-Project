import { Link } from "react-router";

import { cn, getInitials } from "@/lib/utils";

/**
 * CreatorCard — typographic portrait: initials in a hairline frame instead of
 * a photograph, which keeps a creator grid editorial rather than social-app.
 */
export function CreatorCard({ creator, className, compact = false }) {
  return (
    <Link
      to={`/creators/${creator.handle}`}
      className={cn(
        "group flex items-start gap-4 py-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center border border-border-strong font-serif text-crimson transition-colors group-hover:border-ink",
          compact ? "size-10 text-[14px]" : "size-12 text-[17px]",
        )}
      >
        {getInitials(creator.name)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[16px] leading-tight text-ink group-hover:text-arcane-bright">
          {creator.name}
        </span>

        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
          @{creator.handle}
          {creator.location ? (
            <>
              <span aria-hidden="true" className="mx-1.5">
                ·
              </span>
              {creator.location}
            </>
          ) : null}
        </span>

        {!compact && creator.bio ? (
          <span className="clamp-2 mt-1.5 block text-[13px] leading-relaxed text-ink-muted">
            {creator.bio}
          </span>
        ) : null}

        <span className="mt-1.5 block text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          {creator.storyCount ?? 0} stories
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {creator.followers.toLocaleString("en-GB")} followers
        </span>
      </span>
    </Link>
  );
}
