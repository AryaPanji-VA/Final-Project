import { Link } from "react-router";
import { BookMarked, Menu, Search, X } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useDashboardShell } from "@/layouts/dashboard-layout";

function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function Navbar() {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useDashboardShell();

  const userName = user?.name || "User";
  const userInitials = getInitials(userName);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-4 md:px-8">
        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground md:hidden"
          >
            {isSidebarOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Wordmark */}
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <BookMarked className="size-5 text-primary" aria-hidden="true" />
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Lorekeeper
            </span>
          </Link>

          {/* Desktop Tagline */}
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            The Archive of Imagined Worlds
          </p>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Search */}
          <Link
            to="/discover"
            aria-label="Explore and search universes"
            title="Discover"
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
          >
            <Search className="size-4" aria-hidden="true" />
          </Link>

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <div
              aria-label={`${userName} avatar`}
              role="img"
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-[10px] font-semibold text-primary"
            >
              {userInitials}
            </div>

            <span className="hidden max-w-32 truncate text-sm text-muted-foreground md:inline">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
