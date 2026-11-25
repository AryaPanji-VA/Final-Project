import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Compass, Library, PlusCircle } from "lucide-react";

import { universeService } from "@/services/mock-api";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { user } = useAuth();
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

  const totalEntries = universes.reduce((sum, universe) => sum + universe.entries, 0);

  return (
    <>
      <PageHeader
        title={`Selamat datang, ${user?.name ?? "Penjaga Lore"}`}
        description="Ringkasan dunia yang sedang kamu bangun. Lanjutkan entri yang tertunda, atau buka dunia baru."
        actions={
          <Button asChild>
            <Link to="/universes/create">
              <PlusCircle aria-hidden /> Universe baru
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat ringkasan dunia..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-sans font-medium">Universes</CardTitle>
              <Library className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">{universes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-sans font-medium">Total entri lore</CardTitle>
              <BookOpen className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">{totalEntries}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-sans font-medium">Dunia publik</CardTitle>
              <Compass className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="font-serif text-3xl">
                <Link to="/discover" className="text-primary hover:underline">
                  Jelajahi
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !error && universes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Belum ada universe"
            description="Buat universe pertama untuk mulai menyusun lore, karakter, dan timeline."
            action={
              <Button asChild>
                <Link to="/universes/create">Buat universe</Link>
              </Button>
            }
          />
        </div>
      ) : null}
    </>
  );
}
