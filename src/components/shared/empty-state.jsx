import { cn } from "@/lib/utils";

/**
 * EmptyState — a quiet printed notice between two rules, not a dashed box.
 * Optional `icon` and `action`; the copy carries the message.
 */
export function EmptyState({ title, description, action, icon: Icon, className, children }) {
  return (
    <div className={cn("border-y border-border py-14 text-center", className)}>
      {Icon ? (
        <Icon className="mx-auto mb-4 size-6 text-ink-faint" aria-hidden="true" strokeWidth={1.5} />
      ) : null}

      {children}

      <p className="type-section text-[21px] leading-snug text-ink">{title}</p>

      {description ? (
        <p className="mx-auto mt-2.5 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export { ErrorState } from "./error-state";
