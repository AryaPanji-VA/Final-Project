import { forwardRef } from "react";
import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

/* 44px on mobile for touch, 40px from sm up. */
const field =
  "w-full rounded-[3px] border bg-surface text-[14px] text-ink transition-[border-color,box-shadow] duration-[130ms] ease-[var(--ease-editorial)] placeholder:text-ink-faint focus-visible:outline-none focus-visible:border-arcane-bright focus-visible:ring-1 focus-visible:ring-arcane-bright/25 disabled:cursor-not-allowed disabled:bg-paper-muted disabled:text-ink-faint";

const height = "h-11 sm:h-10";

const Input = forwardRef(function Input({ className, type = "text", invalid = false, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(field, height, "px-3", invalid ? "border-alert" : "border-control", className)}
      {...props}
    />
  );
});

const Textarea = forwardRef(function Textarea({ className, rows = 5, invalid = false, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        field,
        "resize-y px-3 py-2.5 leading-relaxed",
        invalid ? "border-alert" : "border-control",
        className,
      )}
      {...props}
    />
  );
});

/** Native select, styled to match Input — keeps mobile pickers and RHF registration. */
const Select = forwardRef(function Select({ className, invalid = false, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          field,
          height,
          "cursor-pointer appearance-none pl-3 pr-9",
          invalid ? "border-alert" : "border-control",
          "[&>option]:bg-surface [&>option]:text-ink",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      />
    </div>
  );
});

const SearchInput = forwardRef(function SearchInput({ className, ...props }, ref) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        className={cn(
          field,
          height,
          "border-control pl-9 pr-3 [&::-webkit-search-cancel-button]:appearance-none",
          className,
        )}
        {...props}
      />
    </div>
  );
});

export { Input, Textarea, Select, SearchInput };
