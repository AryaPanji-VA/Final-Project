import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({ message = "Ada kendala saat memuat data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center">
      <TriangleAlert className="size-6 text-destructive" aria-hidden />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
