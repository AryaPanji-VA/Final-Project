import { NavLink } from "react-router";
import { BookOpen, Compass, LayoutDashboard, Library, Network, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/universes", label: "My Universes", icon: Library, end: true },
  { to: "/discover", label: "Discover", icon: Compass, end: true },
];

const sectionItems = [
  { to: "/universes/unv-1/lore", label: "Lore Encyclopedia", icon: BookOpen },
  { to: "/universes/unv-1/timeline", label: "Timeline", icon: Network },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <NavLink to="/" className="flex items-center gap-2 border-b border-border px-6 py-5">
        <Library className="size-5 text-primary" aria-hidden />
        <span className="font-serif text-xl font-semibold tracking-tight">Lorekeeper</span>
      </NavLink>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ruang kerja
        </p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}

        <p className="px-3 pb-1 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Aethermoor (unv-1)
        </p>
        {sectionItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/universes/create"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
        >
          <PlusCircle className="size-4" aria-hidden />
          Universe baru
        </NavLink>
      </div>
    </aside>
  );
}
