import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { loreService, universeService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoreEncyclopediaPage() {
  const { universeId } = useParams();
  const [universe, setUniverse] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadEntries() {
      setIsLoading(true);
      setError(null);
      try {
        const [universeData, loreData] = await Promise.all([
          universeService.get(universeId),
          loreService.list(universeId),
        ]);
        setUniverse(universeData);
        setEntries(loreData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadEntries();
  }, [universeId]);

  if (isLoading) return <LoadingState label="Memuat ensiklopedia..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <PageHeader
        title="Lore Encyclopedia"
        description={universe ? `Entri lore untuk dunia ${universe.name}. Klik kartu untuk detail.` : "Entri lore dunia kamu."}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/universes/${universeId}/lore/lore-1/edit`}>Edit entri pertama</Link>
          </Button>
        }
      />

      {entries.length === 0 ? (
        <EmptyState
          title="Belum ada entri lore"
          description="Mulai dokumentasikan karakter, lokasi, faksi, dan artefak dunia kamu."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <button key={entry.id} type="button" onClick={() => setSelected(entry)} className="text-left">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardDescription>{entry.category}</CardDescription>
                  <CardTitle>{entry.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{entry.summary}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.category} · Universe {universe?.name}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed">{selected?.summary}</p>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/universes/${universeId}/lore/${selected?.id}/edit`}>Buka di editor</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
