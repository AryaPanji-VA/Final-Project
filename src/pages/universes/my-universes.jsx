import { useEffect, useState } from "react";
import { Link } from "react-router";

import { universeService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MyUniversesPage() {
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    universeService
      .list()
      .then((data) => setUniverses(data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="My Universes"
        description="Semua dunia yang kamu kelola, beserta jumlah entri lore di dalamnya."
        actions={
          <Button variant="outline" asChild>
            <Link to="/universes/create">Buat universe baru</Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat universe kamu..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : universes.length === 0 ? (
        <EmptyState
          title="Belum ada universe"
          description="Setiap dunia dimulai dari satu halaman kosong. Mulai sekarang."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {universes.map((universe) => (
            <Link key={universe.id} to={`/universes/${universe.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle>{universe.name}</CardTitle>
                  <CardDescription>{universe.genre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{universe.description}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {universe.entries} entri lore · diubah {universe.updatedAt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
