import { Link, useNavigate } from "react-router";
import { LogOut, Plus } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="font-serif text-lg font-semibold md:hidden">
          Lorekeeper
        </Link>

        <div className="hidden text-sm text-muted-foreground md:block">
          Ensiklopedia dunia yang kamu bangun, satu entri demi satu entri.
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button size="sm" asChild>
                <Link to="/universes/create">
                  <Plus aria-hidden /> Universe
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Keluar">
                <LogOut aria-hidden />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
