import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { BookMarked, Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { SearchDialog } from "@/components/shared/search-dialog";
import { AccountMenu } from "@/components/shared/account-menu";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/discover", label: "Discover" },
  { to: "/stories", label: "Stories" },
  { to: "/creators", label: "Creators" },
];

/**
 * PublicLayout — the editorial shell (§7.1).
 *
 * A single hairline top bar, no sidebar, wide content column. Public pages are
 * for reading, so navigation stays out of the way and the content is the hero.
 */
export function PublicLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  // The drawer remembers the route it was opened on, so navigating closes it
  // without a setState-in-effect.
  const [menuPath, setMenuPath] = useState(null);
  const isMenuOpen = menuPath === pathname;

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

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-[13px] focus:text-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between gap-6 px-5 sm:h-[64px] sm:px-8">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              to="/"
              className="flex min-h-11 shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:min-h-0"
            >
              <BookMarked className="size-[18px] text-brass" aria-hidden="true" />
              <span className="flex min-h-11 items-center type-display text-[17px] text-ink sm:min-h-0">
                Lorekeeper
              </span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
              {PUBLIC_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "relative py-1 text-[13.5px] transition-colors",
                      isActive ? "text-ink" : "text-ink-muted hover:text-ink",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-crimson-bright transition-transform duration-[150ms]",
                          isActive ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
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

            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="flex h-9 items-center px-3 text-[13.5px] text-ink-muted transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex h-9 items-center rounded-[3px] border border-ink px-4 text-[13.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  Join
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuPath(isMenuOpen ? null : pathname)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="public-menu"
              className="flex size-11 items-center justify-center rounded-[3px] text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink md:hidden"
            >
              {isMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <nav id="public-menu" aria-label="Main" className="border-t border-border bg-paper px-5 py-2 md:hidden">
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center border-b border-border text-[14px] last:border-b-0",
                    isActive ? "text-ink" : "text-ink-muted",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <NavLink
                to="/library"
                className="flex h-11 items-center border-t border-border text-[14px] text-ink-muted"
              >
                My Library
              </NavLink>
            ) : (
              <Link
                to="/login"
                className="flex h-11 items-center border-t border-border text-[14px] text-ink-muted"
              >
                Sign in
              </Link>
            )}
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1">
        <div key={pathname} className="page-enter mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          {children ?? <Outlet />}
        </div>
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="type-display text-[16px] text-ink">Lorekeeper</p>
            <p className="mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-ink-muted">
              Every world has a story. Every story has a place.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="overline flex min-h-11 items-center text-ink-faint transition-colors hover:text-ink sm:min-h-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mx-auto w-full max-w-[1280px] border-t border-border px-5 py-4 sm:px-8">
          <p className="overline text-ink-faint">© 2026 Lorekeeper — a fictional archive</p>
        </div>
      </footer>

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
