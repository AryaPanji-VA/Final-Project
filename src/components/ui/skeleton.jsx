function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-elevated ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex h-12 items-center gap-3">
          <Skeleton className="size-8 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonStats };
