import { cn } from "@/lib/utils";

/** Skeleton — a quiet paper-grey block. Content loading only, never a spinner. */
function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton rounded-[2px] bg-paper-muted", className)}
      {...props}
    />
  );
}

/** Cover-shaped skeleton for story cards (2:3 portrait). */
function SkeletonCover({ className }) {
  return <Skeleton className={cn("aspect-[2/3] w-full", className)} />;
}

function SkeletonCard({ className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <SkeletonCover />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

function SkeletonRow({ className }) {
  return (
    <div className={cn("flex items-center gap-4 py-4", className)} aria-hidden="true">
      <Skeleton className="h-20 w-14 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

function SkeletonList({ rows = 4, className }) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
}

function SkeletonStats({ count = 3, className }) {
  return (
    <div className={cn("grid grid-cols-3 divide-x divide-border border-y border-border", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2.5 px-5 py-5 first:pl-0">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCover, SkeletonCard, SkeletonRow, SkeletonList, SkeletonStats };
