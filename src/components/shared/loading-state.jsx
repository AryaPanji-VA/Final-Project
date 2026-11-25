import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <LoaderCircle className="size-6 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}
