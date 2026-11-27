import { cn } from "@/lib/utils";

/**
 * Tabs — underline tabs with a sliding ink rule. The indicator is a 2px bar
 * that sits under the active label; §8 calls for a 150ms translate.
 */
export function Tabs({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn("flex items-center gap-6 border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Tab({ active = false, className, children, ...props }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "relative -mb-px flex h-11 items-center gap-2 whitespace-nowrap px-0.5 text-[13px] font-medium transition-colors duration-[130ms] sm:h-9",
        active ? "text-ink" : "text-ink-faint hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}

      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-[150ms] ease-[var(--ease-editorial)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </button>
  );
}

/**
 * SegmentedControl — boxed, joined segments like a printed form's choice row.
 * Used for view toggles and reading settings.
 */
export function SegmentedControl({ value, onChange, options, label, className }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-stretch border border-border-strong max-sm:w-full",
        className,
      )}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }, index) => {
        const isActive = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            aria-pressed={isActive}
            aria-label={optionLabel}
            title={optionLabel}
            className={cn(
              "flex h-11 items-center justify-center gap-1.5 px-3 text-[12px] font-medium transition-colors duration-[130ms] sm:h-8",
              "max-sm:flex-1",
              index > 0 && "border-l border-border-strong",
              isActive
                ? "bg-ink text-paper"
                : "bg-surface text-ink-muted hover:bg-paper-muted hover:text-ink",
            )}
          >
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {Icon ? null : <span className="truncate">{optionLabel}</span>}
          </button>
        );
      })}
    </div>
  );
}
