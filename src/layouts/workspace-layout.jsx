import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  BookMarked,
  BookOpen,
  Compass,
  Feather,
  Hourglass,
  LayoutDashboard,
  Library,
  Menu,
  ScrollText,
  Search,
  Settings,
  Swords,
  UserRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/shared/account-menu";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { UniverseSwitcher } from "@/components/shared/universe-switcher";
import { SearchDialog } from "@/components/shared/search-dialog";

/**
 * WorkspaceLayout — the working shell (§5, §7.1, §9).
 *
 * Three sidebar states:
 *   < 768px  drawer over the page, opened from the top bar
 *   768–1023 a 64px icon rail, labels hidden, names in title attributes
 *   ≥ 1024   the full 248px sidebar with grouped destinations
 *
 * The universe switcher and the WORLD BUILDING group only exist inside a
 * universe; the group is hidden rather than disabled when there is no world
 * in context.
 */
export function WorkspaceLayout() {
  const { pathname } = useLocation();

  // The drawer remembers the route it was opened on, so navigating closes it.
  const [drawerPath, setDrawerPath] = useState(null);
  const isOpen = drawerPath === pathname;

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const universeMatch = pathname.match(/^\/studio\/worlds\/([^/]+)/);
  const universeId = universeMatch && universeMatch[1] !== "new" ? universeMatch[1] : null;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") setDrawerPath(null);
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex min-h-dvh bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-[13px] focus:text-ink"
      >
        Skip to content
      </a>

      {isOpen ? (
        <div
          aria-hidden="true"
          onClick={() => setDrawerPath(null)}
          className="fixed inset-0 z-[45] bg-ink/40 md:hidden"
        />
      ) : null}

      <aside
        id="workspace-nav"
        aria-label="Workspace"
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-surface",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[248px] max-md:max-w-[82vw]",
          "max-md:transition-transform max-md:duration-200 max-md:ease-[var(--ease-editorial)]",
          "md:sticky md:top-0 md:h-dvh md:w-16 lg:w-[248px]",
          isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full max-md:invisible",
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border px-3 lg:px-4">
          <Link
            to="/"
            className="flex min-h-11 min-w-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:min-h-0"
          >
            <BookMarked className="size-[17px] shrink-0 text-brass" aria-hidden="true" />
            <span className="hidden truncate font-serif text-[17px] tracking-[-0.01em] text-ink lg:inline">
              Lorekeeper
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerPath(null)}
            aria-label="Close navigation"
            className="flex size-11 items-center justify-center rounded-[3px] text-ink-muted hover:bg-paper-muted hover:text-ink md:hidden"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <UniverseSwitcher />

        <nav aria-label="Workspace sections" className="flex-1 overflow-y-auto px-2 py-5 lg:px-3">
          <NavGroup label="Workspace">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/studio" icon={Feather} label="My Creations" end />
            <NavItem to="/library" icon={Library} label="My Library" />
            <NavItem to="/discover" icon={Compass} label="Discover" />
          </NavGroup>

          {universeId ? (
            <NavGroup label="World building">
              <NavItem
                to={`/studio/worlds/${universeId}/lore`}
                icon={BookOpen}
                label="Encyclopedia"
              />
              <NavItem
                to={`/studio/worlds/${universeId}/timeline`}
                icon={Hourglass}
                label="Timeline"
              />
              <NavItem to={`/studio/worlds/${universeId}`} icon={BookMarked} label="Overview" end />
            </NavGroup>
          ) : null}

          <NavGroup label="Create">
            <NavItem to="/studio/writing" icon={ScrollText} label="Writing Studio" />
            <NavItem to="/studio/worlds" icon={BookMarked} label="Worldbuilding" />
            <NavItem to="/studio/campaigns" icon={Swords} label="RPG Studio" />
          </NavGroup>

          <NavGroup label="Account">
            <NavItem to="/profile" icon={UserRound} label="Profile" />
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </NavGroup>
        </nav>

        <div className="shrink-0 border-t border-border p-2 lg:p-3">
          <Link
            to="/studio/writing/new"
            title="New Story"
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-[3px] bg-crimson text-[13px] font-medium text-onaccent transition-colors hover:bg-crimson-deep md:h-9",
              "md:px-0 lg:px-3",
            )}
          >
            <Feather className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">New Story</span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-[2px]">
          <div className="flex h-[60px] items-center justify-between gap-3 px-5 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerPath(pathname)}
                aria-label="Open navigation"
                aria-expanded={isOpen}
                aria-controls="workspace-nav"
                className="flex size-11 shrink-0 items-center justify-center rounded-[3px] text-ink-muted hover:bg-paper-muted hover:text-ink md:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              <p className="truncate font-serif text-[14px] italic text-ink-faint sm:hidden">
                The Archive of Imagined Worlds
              </p>

              <Breadcrumbs className="hidden sm:block" />
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search stories and creators"
                className="flex size-11 items-center justify-center rounded-[3px] text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:size-9"
              >
                <Search className="size-4" aria-hidden="true" />
              </button>

              <AccountMenu />
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-5 py-8 sm:px-8">
          <div key={pathname} className="page-enter mx-auto w-full max-w-[1120px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border px-5 py-4 sm:px-8">
          <p className="mx-auto w-full max-w-[1120px] text-[11px] uppercase tracking-[0.1em] text-ink-faint">
            Lorekeeper — the archive of imagined worlds
          </p>
        </footer>
      </div>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}

function NavGroup({ label, children }) {
  return (
    <div className="mb-5 last:mb-0 lg:mb-6">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint md:hidden lg:block">
        {label}
      </p>

      {/* Rail state only (768–1023): labels are hidden, so the group becomes a
          hairline and the sections still read as separate blocks. */}
      <div aria-hidden="true" className="mx-1 mb-2 hidden h-px bg-border md:block lg:hidden" />

      {children}
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        cn(
          "relative flex h-11 items-center gap-2.5 rounded-[2px] px-2 text-[13.5px] transition-colors md:h-9",
          "md:justify-center md:px-0 lg:justify-start lg:px-2",
          isActive
            ? "bg-paper-muted text-ink"
            : "text-ink-muted hover:bg-paper-muted/60 hover:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-y-1.5 left-0 w-px bg-ink transition-opacity",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
          <Icon
            className={cn("size-4 shrink-0", isActive ? "text-crimson" : "text-ink-faint")}
            aria-hidden="true"
          />
          <span className="truncate lg:inline md:hidden">{label}</span>
        </>
      )}
    </NavLink>
  );
}
