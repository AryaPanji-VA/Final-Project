import { Skeleton } from "@/components/ui/skeleton";

/**
 * RouteFallback — shown while a split route chunk is downloading.
 *
 * A skeleton of the page masthead plus a content block: the same shapes the
 * page will paint, so the swap does not jump. No spinner (§7.3).
 */
export function RouteFallback() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-[1280px] px-5 py-12 sm:px-8"
    >
      <span className="sr-only">Loading page…</span>

      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-5 h-11 w-[min(100%,26rem)]" />
      <Skeleton className="mt-4 h-4 w-[min(100%,32rem)]" />
      <Skeleton className="mt-2 h-4 w-[min(100%,24rem)]" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[16/9] w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
