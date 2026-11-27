import {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonRow,
  SkeletonStats,
} from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Content loading uses skeletons, never a spinner. The only spinner in the app
 * is the 16px one inside a submitting button.
 *
 *   covers → portrait cover grid (stories)
 *   rows   → stacked story rows (library, lists)
 *   stats  → editorial stat row
 *   prose  → form / editor page
 */
export function LoadingState({ variant = "rows", count = 4, label = "Loading…", className }) {
  const content = () => {
    if (variant === "covers") {
      return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (variant === "stats") return <SkeletonStats />;

    if (variant === "prose") {
      return (
        <div className="space-y-5">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-9 w-32" />
        </div>
      );
    }

    if (variant === "rows") return <SkeletonList rows={count} />;

    return <SkeletonRow />;
  };

  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {content()}
    </div>
  );
}
