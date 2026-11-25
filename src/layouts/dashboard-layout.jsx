import { NavLink, Outlet } from "react-router";
import { Library } from "lucide-react";

import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-8">
          Lorekeeper — platform worldbuilding. Kelola lore, timeline, dan universe kamu.
        </footer>
      </div>
    </div>
  );
}

// Layout halaman publik (login, register, discover sebelum login).
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <NavLink to="/" className="mb-8 flex items-center gap-2">
        <Library className="size-6 text-primary" aria-hidden />
        <span className="font-serif text-2xl font-semibold tracking-tight">Lorekeeper</span>
      </NavLink>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">
        Bangun dunia kamu. Simpan lore-nya. Mulai dari sini.
      </p>
    </div>
  );
}
