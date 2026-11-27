import { Link } from "react-router";

import { cn, formatRelativeDate } from "@/lib/utils";
import { StoryCover } from "@/components/shared/story-cover";
import { StatusBadge } from "@/components/ui/badge";

/**
 * StoryCard — cover-led. The cover carries the weight; the meta sits directly
 * on the paper underneath. No container box, which is what keeps a grid of
 * these from reading as a dashboard (§12: no excessive card containers).
 */
export function StoryCard({ story, className, size = "md", showStatus = false }) {
  const coverSize = size === "sm" ? "sm" : "md";

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        to={`/stories/${story.slug}`}
        aria-label={`${story.title} by ${story.author?.name ?? "unknown"}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      >
        <div className="relative overflow-hidden rounded-[2px] ring-1 ring-ink/10">
          <StoryCover
            story={story}
            size={coverSize}
            className="transition-transform duration-[240ms] ease-[var(--ease-editorial)] group-hover:-translate-y-1"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="overline text-ink-faint">{story.genre}</span>
          {showStatus ? <StatusBadge status={story.status} /> : null}
        </div>

        <h3 className="mt-1.5 font-serif text-[17px] leading-[1.25] text-ink">
          <Link
            to={`/stories/${story.slug}`}
            className="underline-offset-4 hover:text-arcane-bright hover:underline"
          >
            {story.title}
          </Link>
        </h3>

        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {story.author ? (
            <Link
              to={`/creators/${story.author.handle}`}
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {story.author.name}
            </Link>
          ) : (
            "Unattributed"
          )}
          <span aria-hidden="true" className="mx-1.5 text-ink-faint">
            ·
          </span>
          {story.chapterCount > 0 ? `${story.chapterCount} chapters` : "No chapters"}
        </p>
      </div>
    </article>
  );
}

/**
 * StoryRow — the horizontal variant. Used in the library, creator pages and
 * anywhere a cover grid would be too heavy.
 */
export function StoryRow({ story, className, trailing }) {
  return (
    <article className={cn("group flex items-start gap-4 py-4", className)}>
      <Link
        to={`/stories/${story.slug}`}
        className="w-12 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright"
        aria-hidden="true"
        tabIndex={-1}
      >
        <StoryCover story={story} size="xs" />
      </Link>

      <div className="min-w-0 flex-1">
        <span className="overline text-ink-faint">{story.genre}</span>

        <h3 className="mt-1 font-serif text-[16px] leading-[1.3] text-ink">
          <Link
            to={`/stories/${story.slug}`}
            className="underline-offset-4 hover:text-arcane-bright hover:underline"
          >
            {story.title}
          </Link>
        </h3>

        <p className="clamp-2 mt-1 text-[13px] leading-relaxed text-ink-muted">{story.synopsis}</p>

        <p className="mt-1.5 text-[11.5px] text-ink-faint">
          {story.author?.name}
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {story.chapterCount} chapters
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {story.reads.toLocaleString("en-GB")} reads
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {formatRelativeDate(story.updatedAt)}
        </p>
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </article>
  );
}
