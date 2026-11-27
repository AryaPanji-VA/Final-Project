import { useNavigate } from "react-router";
import { CircleUser, LayoutGrid, LogOut, Settings } from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "@/components/ui/dropdown";

/** AccountMenu — avatar + name in the top bar, with the account dropdown. */
export function AccountMenu({ className }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name || "Keeper";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Dropdown
      align="end"
      className={cn("shrink-0", className)}
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="flex h-11 items-center gap-2 rounded-[3px] px-1.5 transition-colors hover:bg-paper-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arcane-bright sm:h-9"
        >
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong font-serif text-[11px] text-crimson"
          >
            {getInitials(name)}
          </span>
          <span className="hidden max-w-28 truncate text-[13px] text-ink-muted sm:inline">{name}</span>
        </button>
      )}
    >
      <DropdownLabel>{name}</DropdownLabel>
      <DropdownSeparator />

      <DropdownItem icon={LayoutGrid} onClick={() => navigate("/studio")}>
        My creations
      </DropdownItem>
      <DropdownItem icon={CircleUser} onClick={() => navigate("/profile")}>
        Profile
      </DropdownItem>
      <DropdownItem icon={Settings} onClick={() => navigate("/settings")}>
        Settings
      </DropdownItem>

      <DropdownSeparator />

      <DropdownItem icon={LogOut} destructive onClick={handleLogout}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
