import { cn } from "@/lib/utils";
import { SearchInput, Select } from "@/components/ui/input";

/**
 * Toolbar — the filter row above a collection. A hairline above and below, no
 * sticky positioning and no card: it reads as a printed index header.
 *
 * Below sm the controls stack full width (search, then filters); from sm up
 * they sit on one line with the action group pushed right.
 */
export function Toolbar({ children, className }) {
  return (
    <div className={cn("border-y border-border py-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
    </div>
  );
}

export function ToolbarSearch({ value, onChange, placeholder = "Search…", className, ...props }) {
  return (
    <div className={cn("w-full sm:max-w-[300px]", className)}>
      <SearchInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        {...props}
      />
    </div>
  );
}

export function ToolbarGroup({ className, children }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:ml-auto", className)}>{children}</div>
  );
}

/** Filter select sized for the toolbar row. */
export function ToolbarSelect({ className, ...props }) {
  return <Select className={cn("w-full min-w-0 sm:w-auto sm:min-w-[132px]", className)} {...props} />;
}
