import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ErrorState — an alert rule with a retry action, not a red box.
 * A single 2px rule in the margin carries the emphasis; the copy does the rest.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "The archive could not be read. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <div role="alert" className={cn("border-l-2 border-alert bg-alert/5 py-7 pl-5 pr-5", className)}>
      <p className="font-serif text-[18px] leading-snug text-ink">{title}</p>
      <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-ink-muted">{message}</p>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
