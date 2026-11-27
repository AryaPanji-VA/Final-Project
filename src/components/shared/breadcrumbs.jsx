import { Link, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Route segment → readable label. IDs are replaced by the entity they name. */
const LABELS = {
  studio: "Studio",
  writing: "Writing Studio",
  worlds: "Worldbuilding",
  campaigns: "RPG Studio",
  lore: "Encyclopedia",
  timeline: "Timeline",
  chapter: "Chapter",
  library: "My Library",
  profile: "Profile",
  settings: "Settings",
  stories: "Stories",
  creators: "Creators",
  discover: "Discover",
  universes: "Universes",
  new: "New",
};

/**
 * Breadcrumbs — the workspace navbar's contextual trail (§5).
 * Segments that look like ids (`unv-1`, `st-1`, `c-2`, `lore-3`) are skipped:
 * they are not readable, and their parent already says where you are.
 */
export function Breadcrumbs({ className }) {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [];

  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;

    if (/^[a-z]{2,5}-[a-z0-9]+$/.test(segment)) continue;

    crumbs.push({ path, label: LABELS[segment] ?? segment.replace(/-/g, " ") });
  }

  if (crumbs.length === 0) {
    return (
      <p className={cn("truncate font-serif text-[14px] italic text-ink-faint", className)}>
        The Archive of Imagined Worlds
      </p>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5 overflow-hidden">
        <li className="shrink-0">
          <Link
            to="/studio"
            className="text-[12.5px] text-ink-faint transition-colors hover:text-ink"
          >
            Studio
          </Link>
        </li>

        {crumbs.slice(1).map((crumb, index, list) => {
          const isLast = index === list.length - 1;

          return (
            <li key={crumb.path} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="size-3 shrink-0 text-ink-faint/70" aria-hidden="true" />

              {isLast ? (
                <span aria-current="page" className="truncate text-[12.5px] text-ink">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="truncate text-[12.5px] text-ink-faint transition-colors hover:text-ink"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
