import { BookOpen } from "lucide-react";

export function EmptyState({ title = "Belum ada data", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <BookOpen className="size-8 text-muted-foreground/60" aria-hidden />
      <p className="font-serif text-lg">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
