import { useEffect, useState } from "react";

import { discoverService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DiscoverPage() {
  const [universes, setUniverses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    discoverService
      .listPublic()
      .then((data) => setUniverses(data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Discover"
        description="Dunia publik yang dibagikan penulis lore lain. Temu inspirasi, atau tempatkan dunia kamu di sini."
      />

      {isLoading ? (
        <LoadingState label="Memuat dunia publik..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : universes.length === 0 ? (
        <EmptyState
          title="Belum ada dunia publik"
          description="Jadikan salah satu universe kamu publik agar tampil di sini."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {universes.map((universe) => (
            <Card key={universe.id} className="h-full">
              <CardHeader>
                <CardTitle>{universe.name}</CardTitle>
                <CardDescription>
                  {universe.genre} · oleh {universe.owner}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{universe.description}</p>
                <p className="mt-4 text-xs text-muted-foreground">{universe.entries} entri lore</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
