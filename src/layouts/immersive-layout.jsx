import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { ArrowLeft, List, Minus, Plus, Moon, Sun, X } from "lucide-react";

import { cn } from "@/lib/utils";

const THEME_KEY = "lorekeeper_reader_theme";
const SIZE_KEY = "lorekeeper_reader_size";

/**
 * ImmersiveLayout — the reader (§7.5).
 *
 * Minimal chrome, a 760px text column, and a settings panel for theme and type
 * size. The chrome hides on scroll-down so the page is text. This is the only
 * place the Parchment (light) theme exists: the rest of the product stays
 * obsidian, because long-form reading is the one task that may want paper.
 */
export function ImmersiveLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) ?? "obsidian");
  const [size, setSize] = useState(() => Number(localStorage.getItem(SIZE_KEY)) || 100);

  // Reader theme is scoped to this layout, so it is applied and cleaned up here.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "parchment") root.dataset.theme = "parchment";
    else delete root.dataset.theme;

    localStorage.setItem(THEME_KEY, theme);

    return () => {
      delete root.dataset.theme;
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SIZE_KEY, String(size));
  }, [size]);

  // Hide the top bar while reading downward, restore on scroll up.
  useEffect(() => {
    let last = window.scrollY;

    function onScroll() {
      const current = window.scrollY;
      if (current < 80) setIsChromeVisible(true);
      else if (current > last + 8) setIsChromeVisible(false);
      else if (current < last - 8) setIsChromeVisible(true);
      last = current;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setIsSettingsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-paper text-ink transition-colors duration-200">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-border bg-paper/95 backdrop-blur-[2px] transition-transform duration-200",
          isChromeVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex size-11 items-center justify-center rounded-[3px] text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink sm:size-9"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>

            <Link
              to="/"
              className="truncate font-serif text-[15px] text-ink-muted transition-colors hover:text-ink"
            >
              Lorekeeper
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((value) => !value)}
              aria-label="Reading settings"
              aria-expanded={isSettingsOpen}
              className="flex size-11 items-center justify-center rounded-[3px] text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink sm:size-9"
            >
              <List className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSettingsOpen ? (
          <div className="border-t border-border bg-surface">
            <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-6 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="overline text-ink-faint">Theme</span>

                <div className="inline-flex border border-border-strong">
                  <button
                    type="button"
                    onClick={() => setTheme("parchment")}
                    aria-pressed={theme === "parchment"}
                    className={cn(
                      "flex h-9 items-center gap-1.5 px-2.5 text-[12px] transition-colors",
                      theme === "parchment"
                        ? "bg-ink text-paper"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <Sun className="size-3.5" aria-hidden="true" />
                    Parchment
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("obsidian")}
                    aria-pressed={theme === "obsidian"}
                    className={cn(
                      "flex h-9 items-center gap-1.5 border-l border-border-strong px-2.5 text-[12px] transition-colors",
                      theme === "obsidian"
                        ? "bg-ink text-paper"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <Moon className="size-3.5" aria-hidden="true" />
                    Obsidian
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="overline text-ink-faint">Type size</span>

                <div className="inline-flex items-center border border-border-strong">
                  <button
                    type="button"
                    onClick={() => setSize((value) => Math.max(85, value - 5))}
                    aria-label="Decrease type size"
                    disabled={size <= 85}
                    className="flex size-9 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>

                  <span className="min-w-12 border-x border-border-strong py-1.5 text-center font-mono text-[11px] text-ink">
                    {size}%
                  </span>

                  <button
                    type="button"
                    onClick={() => setSize((value) => Math.min(130, value + 5))}
                    aria-label="Increase type size"
                    disabled={size >= 130}
                    className="flex size-9 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="ml-auto flex size-9 items-center justify-center text-ink-faint hover:text-ink"
                aria-label="Close reading settings"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main
        key={pathname}
        className="page-enter mx-auto w-full max-w-[760px] px-5 pb-24 pt-24 sm:px-8"
        style={{ "--reader-scale": size / 100 }}
      >
        <Outlet context={{ theme }} />
      </main>
    </div>
  );
}

/** Applies the reader's type-size preference to the chapter body. */
export function ReaderBody({ children }) {
  return (
    <div
      className="reading"
      style={{ fontSize: `calc(clamp(1.0625rem, 1rem + 0.35vw, 1.1875rem) * var(--reader-scale, 1))` }}
    >
      {children}
    </div>
  );
}
