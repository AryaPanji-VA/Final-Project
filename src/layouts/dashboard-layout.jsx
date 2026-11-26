import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Library } from "lucide-react";

import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";

/**
 * State Application Shell diangkat ke DashboardLayout supaya Navbar bisa
 * membuka/menutup drawer Sidebar tanpa harus menerima props.
 *
 * Integrasi Navbar (dilakukan setelah Navbar selesai dikerjakan):
 *
 *   import { useDashboardShell } from "@/layouts/dashboard-layout";
 *
 *   const { isSidebarOpen, toggleSidebar } = useDashboardShell();
 *
 *   <button
 *     type="button"
 *     onClick={toggleSidebar}
 *     aria-label={isSidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
 *     aria-expanded={isSidebarOpen}
 *     aria-controls="app-sidebar"   // id pada <aside> di Sidebar
 *     className="md:hidden"         // hamburger hanya tampil di mobile
 *   >
 *     <Menu aria-hidden />
 *   </button>
 *
 * Drawer juga menutup sendiri saat pengguna menavigasi (prop onNavigate),
 * saat backdrop diklik, dan saat tombol Escape ditekan.
 */
const DashboardShellContext = createContext(null);

export function useDashboardShell() {
  const context = useContext(DashboardShellContext);

  if (!context) {
    throw new Error("useDashboardShell harus dipakai di dalam DashboardLayout");
  }

  return context;
}

export function DashboardLayout() {
  const { pathname } = useLocation();

  // Drawer diikat ke pathname tempat ia dibuka: navigasi apa pun (link,
  // tombol back browser, redirect) otomatis menutupnya tanpa effect yang
  // memanggil setState.
  const [openPathname, setOpenPathname] = useState(null);
  const isSidebarOpen = openPathname === pathname;

  const openSidebar = useCallback(() => setOpenPathname(pathname), [pathname]);
  const closeSidebar = useCallback(() => setOpenPathname(null), []);
  const toggleSidebar = useCallback(
    () =>
      setOpenPathname((current) => (current === pathname ? null : pathname)),
    [pathname],
  );

  // Kunci scroll body selama drawer terbuka agar konten utama tidak ikut
  // bergeser; nilai sebelumnya dipulihkan saat drawer tertutup.
  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  // Escape menutup drawer, sama seperti klik backdrop.
  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeSidebar();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  const shell = useMemo(
    () => ({ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }),
    [isSidebarOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <DashboardShellContext.Provider value={shell}>
      <div className="flex min-h-screen">
        {/* Backdrop drawer (mobile saja). Di luar <aside> supaya menutupi
            seluruh viewport dan tidak ikut scroll bersama sidebar. */}
        {isSidebarOpen && (
          <div
            aria-hidden="true"
            onClick={closeSidebar}
            className="fixed inset-0 z-[45] bg-black/60 md:hidden"
          />
        )}

        <Sidebar
          open={isSidebarOpen}
          onClose={closeSidebar}
          onNavigate={closeSidebar}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />

          <main className="flex-1 px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-[1120px]">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-border">
            <div className="mx-auto w-full max-w-[1120px] px-4 py-4 text-xs text-muted-foreground md:px-8">
              Lorekeeper — The Archive of Imagined Worlds
            </div>
          </footer>
        </div>
      </div>
    </DashboardShellContext.Provider>
  );
}

// Layout halaman publik (login, register): tanpa sidebar, tanpa Navbar.
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <NavLink to="/" className="mb-8 flex items-center gap-2">
        <Library className="size-6 text-primary" aria-hidden />
        <span className="font-serif text-2xl font-semibold tracking-tight">
          Lorekeeper
        </span>
      </NavLink>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">
        Bangun dunia kamu. Simpan lore-nya. Mulai dari sini.
      </p>
    </div>
  );
}
