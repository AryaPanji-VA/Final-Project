import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ChevronsUpDown, Plus } from "lucide-react";

import { universeService } from "@/services/mock-api";
import { cn, getInitials } from "@/lib/utils";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "@/components/ui/dropdown";

/**
 * UniverseSwitcher — the sidebar's world context (§5).
 *
 * Only rendered when the route is inside a universe; it names the world you are
 * editing and lets you jump to another without going back through the index.
 * The id comes from the URL, so the switcher never disagrees with the page.
 * On the tablet rail it collapses to the world's initials.
 */
export function UniverseSwitcher({ className }) {
  const { pathname } = useLocation();
  const [universes, setUniverses] = useState([]);

  const match = pathname.match(/^\/studio\/worlds\/([^/]+)/);
  const activeId = match && match[1] !== "new" ? match[1] : null;

  useEffect(() => {
    if (!activeId) return undefined;

    let active = true;
    universeService
      .list()
      .then((data) => {
        if (active) setUniverses(data);
      })
      .catch(() => {
        if (active) setUniverses([]);
      });

    return () => {
      active = false;
    };
  }, [activeId]);

  if (!activeId) return null;

  const current = universes.find((universe) => universe.id === activeId);
  const label = current?.name ?? "Universe";

  return (
    <div className={cn("border-b border-border px-2 py-3 lg:px-3", className)}>
      <Dropdown
        className="w-full"
        trigger={({ isOpen, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-label={`Switch universe — currently ${label}`}
            title={label}
            className="flex h-11 w-full items-center gap-2.5 rounded-[2px] border border-border-strong bg-paper px-2 text-left transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright md:h-9 md:justify-center md:px-0 lg:justify-start lg:px-2"
          >
            <span
              aria-hidden="true"
              className="flex size-6 shrink-0 items-center justify-center border border-border-strong font-ui font-semibold text-[10px] text-crimson"
            >
              {getInitials(label)}
            </span>

            <span className="hidden min-w-0 flex-1 lg:block">
              <span className="overline block text-ink-faint">Universe</span>
              <span className="mt-0.5 block truncate type-display text-[13px] leading-none text-ink">
                {label}
              </span>
            </span>

            <ChevronsUpDown
              className="hidden size-3.5 shrink-0 text-ink-faint lg:block"
              aria-hidden="true"
            />
          </button>
        )}
      >
        <DropdownLabel>Switch universe</DropdownLabel>
        <DropdownSeparator />

        {universes.map((universe) => (
          <DropdownItem
            key={universe.id}
            to={`/studio/worlds/${universe.id}`}
            aria-current={universe.id === activeId ? "true" : undefined}
            className={universe.id === activeId ? "text-ink" : undefined}
          >
            {universe.name}
          </DropdownItem>
        ))}

        <DropdownSeparator />

        <DropdownItem icon={Plus} to="/studio/worlds/new">
          New universe
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
