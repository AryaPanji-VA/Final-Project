import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  BookMarked,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Hourglass,
  LayoutDashboard,
  Library,
  LogOut,
  Plus,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { universeService } from "@/services/mock-api";
import { useAuth } from "@/hooks/use-auth";

const workspaceItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/universes", label: "My Universes", icon: Library, end: true },
  { to: "/discover", label: "Discover", icon: Compass, end: true },
];

// Dipakai untuk menurunkan universe aktif langsung dari URL.
const UNIVERSE_PATH = /^\/universes\/([^/]+)(\/.*)?$/;

// Subhalaman universe yang boleh dipertahankan saat berpindah universe.
const UNIVERSE_SUBPAGE = /^\/universes\/[^/]+\/(lore|timeline)(?:\/|$)/;

/**
 * Tujuan navigasi saat universe diganti: kalau pengguna sedang di Encyclopedia
 * atau Timeline, subhalaman yang sama dipertahankan. Halaman lain kembali ke
 * Universe Overview.
 */
function buildUniversePath(universeId, pathname) {
  const base = `/universes/${universeId}`;
  const subpage = pathname.match(UNIVERSE_SUBPAGE)?.[1];

  return subpage ? `${base}/${subpage}` : base;
}

function SidebarLink({ to, label, icon: Icon, end = false, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          // Mobile drawer: target sentuh 44px. Rail tablet 40px. Desktop 36px.
          "group relative flex h-11 items-center gap-[10px] rounded-md px-3 text-sm transition-colors",
          "md:mx-auto md:size-10 md:justify-center md:px-0",
          "lg:mx-0 lg:h-9 lg:w-full lg:justify-start lg:px-3",
          isActive
            ? "bg-primary-muted text-foreground"
            : "text-muted-foreground hover:bg-elevated hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-primary transition-opacity",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />

          <Icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "text-primary" : "text-faint",
            )}
            aria-hidden="true"
          />

          <span className="truncate md:hidden lg:inline">{label}</span>
        </>
      )}
    </NavLink>
  );
}

/**
 * Sidebar Application Shell.
 *
 * Desktop (>=1024px): 264px, sticky, full height.
 * Tablet (768–1023px): rail 64px, ikon saja (label lewat atribut title).
 * Mobile (<768px): drawer 264px; state buka/tutup dipegang DashboardLayout
 * dan dikirim lewat prop `open`, ditutup lewat `onClose` (backdrop / tombol X)
 * maupun `onNavigate` (setiap link yang diklik).
 */
export function Sidebar({ open = false, onClose, onNavigate }) {
  const [universes, setUniverses] = useState([]);
  const [isUniverseMenuOpen, setIsUniverseMenuOpen] = useState(false);
  const universeMenuRef = useRef(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  // Muat daftar universe untuk switcher.
  useEffect(() => {
    let active = true;

    universeService.list().then((data) => {
      if (!active) return;
      setUniverses(data);
    });

    return () => {
      active = false;
    };
  }, []);

  // Universe terpilih adalah derived state dari URL, bukan state terpisah:
  // tidak ada sinkronisasi manual di dalam effect sehingga tidak perlu
  // workaround queueMicrotask.
  const selectedUniverse = useMemo(() => {
    const universeId = pathname.match(UNIVERSE_PATH)?.[1];
    if (!universeId || universeId === "create") return null;

    return universes.find((universe) => universe.id === universeId) ?? null;
  }, [pathname, universes]);

  const sectionItems = useMemo(
    () =>
      selectedUniverse
        ? [
            {
              to: `/universes/${selectedUniverse.id}/lore`,
              label: "Encyclopedia",
              icon: BookOpen,
            },
            {
              to: `/universes/${selectedUniverse.id}/timeline`,
              label: "Timeline",
              icon: Hourglass,
            },
          ]
        : [],
    [selectedUniverse],
  );

  // Dropdown universe: tutup saat klik di luar panel atau tekan Escape.
  useEffect(() => {
    if (!isUniverseMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!universeMenuRef.current?.contains(event.target)) {
        setIsUniverseMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsUniverseMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUniverseMenuOpen]);

  function handleUniverseSelect(universe) {
    setIsUniverseMenuOpen(false);
    onNavigate?.();

    if (universe.id === selectedUniverse?.id) return;

    navigate(buildUniversePath(universe.id, pathname));
  }

  function handleViewAllUniverses() {
    setIsUniverseMenuOpen(false);
    onNavigate?.();
  }

  function handleLogout() {
    logout();
    onNavigate?.();
    navigate("/login");
  }

  return (
    <aside
      id="app-sidebar"
      aria-label="Navigasi utama"
      className={cn(
        "flex w-[264px] shrink-0 flex-col border-r border-border bg-surface",
        // Mobile (<768px): drawer off-canvas 264px di atas konten.
        "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:max-w-[85vw]",
        "max-md:transition-transform max-md:duration-200 max-md:ease-out",
        // Tablet: rail 64px. Desktop: 264px sticky, full height.
        "md:sticky md:top-0 md:z-auto md:h-dvh md:w-16 lg:w-[264px]",
        open
          ? "max-md:translate-x-0"
          : "max-md:-translate-x-full max-md:invisible",
      )}
    >
      {/* WordMark */}
      <div className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:justify-center md:px-0 lg:justify-start lg:px-6">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <BookMarked
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />

          <span className="truncate font-serif text-xl font-semibold tracking-tight text-foreground md:hidden lg:inline">
            Lorekeeper
          </span>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup navigasi"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground md:hidden"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Universe Switcher */}
      {selectedUniverse && (
        <div
          ref={universeMenuRef}
          className="relative shrink-0 border-b border-border p-2 lg:p-3"
        >
          <button
            type="button"
            onClick={() => setIsUniverseMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isUniverseMenuOpen}
            aria-haspopup="menu"
            aria-controls="universe-switcher-menu"
            title={selectedUniverse.name}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md px-2 text-left transition-colors hover:bg-elevated md:px-0 lg:justify-start lg:px-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated font-serif text-xs text-primary">
              {selectedUniverse.name.charAt(0)}
            </span>

            <span className="min-w-0 flex-1 md:hidden lg:block">
              <span className="block truncate text-xs font-medium text-foreground">
                {selectedUniverse.name}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                Current Universe
              </span>
            </span>

            <ChevronDown
              className={cn(
                "hidden size-4 shrink-0 text-faint transition-transform lg:block",
                isUniverseMenuOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown Menu */}
          {isUniverseMenuOpen && (
            <div
              id="universe-switcher-menu"
              role="menu"
              className="absolute left-2 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg lg:left-3"
            >
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-faint">
                Your Universes
              </p>

              {universes.map((universe) => (
                <button
                  key={universe.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleUniverseSelect(universe)}
                  className="flex h-10 w-full items-center gap-3 rounded-md px-2 text-left transition-colors hover:bg-elevated"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated font-serif text-xs text-primary">
                    {universe.name.charAt(0)}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {universe.name}
                  </span>

                  {selectedUniverse.id === universe.id && (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}

              <div className="my-1 border-t border-border" />

              <NavLink
                to="/universes"
                onClick={handleViewAllUniverses}
                className="flex h-10 items-center rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
              >
                View all universes
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4 md:px-0 lg:px-3">
        {/* Workspace */}
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint md:hidden lg:block">
            Workspace
          </p>

          {workspaceItems.map((item) => (
            <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </div>

        {/* World Building */}
        {selectedUniverse && (
          <div className="mt-6">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint md:hidden lg:block">
              World Building
            </p>

            {sectionItems.map((item) => (
              <SidebarLink key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        )}

        {/* Account — hanya Logout; route Settings/Profile belum tersedia. */}
        <div className="mt-auto pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint md:hidden lg:block">
            Account
          </p>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="flex h-11 w-full items-center justify-center gap-[10px] rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-elevated hover:text-destructive md:mx-auto md:size-10 md:px-0 lg:mx-0 lg:h-9 lg:w-full lg:justify-start lg:px-3"
          >
            <LogOut className="size-4 shrink-0 text-faint" aria-hidden="true" />

            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Primary CTA */}
      <div className="shrink-0 border-t border-border p-3">
        <NavLink
          to="/universes/create"
          title="New Universe"
          aria-label="New Universe"
          onClick={onNavigate}
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-background transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface md:size-10 md:px-0 lg:h-10 lg:w-full lg:px-4"
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          <span className="md:hidden lg:inline">New Universe</span>
        </NavLink>
      </div>
    </aside>
  );
}
