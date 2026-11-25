import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { loreService, timelineService, universeService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UniverseOverviewPage() {
  const { universeId } = useParams();
  const [universe, setUniverse] = useState(null);
  const [loreCount, setLoreCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUniverse() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await universeService.get(universeId);
        if (!data) {
          throw new Error("Universe tidak ditemukan.");
        }
        setUniverse(data);
        const [lore, events] = await Promise.all([
          loreService.list(universeId),
          timelineService.list(universeId),
        ]);
        setLoreCount(lore.length);
        setEventCount(events.length);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadUniverse();
  }, [universeId]);

  if (isLoading) {
    return <LoadingState label="Memuat universe..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <>
      <PageHeader
        title={universe.name}
        description={universe.description}
        actions={
          <Button variant="outline" asChild>
            <Link to={`/universes/${universe.id}/lore`}>Buka encyclopedia</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Genre</CardDescription>
            <CardTitle>{universe.genre}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Entri lore</CardDescription>
            <CardTitle>{loreCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={`/universes/${universe.id}/lore`} className="text-sm text-primary hover:underline">
              Kelola entri →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Peristiwa timeline</CardDescription>
            <CardTitle>{eventCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={`/universes/${universe.id}/timeline`} className="text-sm text-primary hover:underline">
              Lihat timeline →
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
