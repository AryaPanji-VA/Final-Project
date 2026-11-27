import { useState } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

/**
 * Dependency-free dropdown: trigger render-prop + conditional panel.
 * Closes on outside pointer-down, Escape, and item selection.
 * Panel motion is a clip reveal (see .menu-panel), not an opacity fade.
 */
export function Dropdown({ trigger, children, align = "start", className, panelClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false), isOpen);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {trigger({ isOpen, toggle: () => setIsOpen((value) => !value) })}

      {isOpen ? (
        <div
          role="menu"
          className={cn(
            "menu-panel absolute top-full z-50 mt-1 min-w-[210px] rounded-[3px] border border-border-strong bg-surface p-1",
            "shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)]",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
      {children}
    </p>
  );
}

const itemClass = (destructive, className) =>
  cn(
    "flex h-11 w-full items-center gap-2.5 rounded-[2px] px-2 text-[13px] transition-colors duration-[130ms] sm:h-8",
    destructive
      ? "text-alert hover:bg-paper-muted"
      : "text-ink-muted hover:bg-paper-muted hover:text-ink",
    className,
  );

/**
 * DropdownItem — a menu row. Pass `to` for a real link (so the item keeps its
 * href and middle-click works), otherwise it renders a button.
 */
export function DropdownItem({
  icon: Icon,
  destructive = false,
  to,
  className,
  children,
  ...props
}) {
  const content = (
    <>
      {Icon ? <Icon className="size-4 shrink-0 opacity-75" aria-hidden="true" /> : null}
      <span className="truncate">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} role="menuitem" className={itemClass(destructive, className)} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={itemClass(destructive, className)}
      {...props}
    >
      {content}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-border" />;
}
