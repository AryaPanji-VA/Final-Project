import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { timelineService, universeService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

export function TimelinePage() {
  const { universeId } = useParams();
  const [universe, setUniverse] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTimeline() {
      setIsLoading(true);
      setError(null);
      try {
        const [universeData, timelineData] = await Promise.all([
          universeService.get(universeId),
          timelineService.list(universeId),
        ]);
        setUniverse(universeData);
        setEvents(timelineData);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadTimeline();
  }, [universeId]);

  if (isLoading) return <LoadingState label="Memuat timeline..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
      <PageHeader
        title="Timeline"
        description={universe ? `Kronologi peristiwa di dunia ${universe.name}.` : "Kronologi peristiwa dunia kamu."}
      />

      {events.length === 0 ? (
        <EmptyState
          title="Belum ada peristiwa"
          description="Tandai momen-momen penting dalam sejarah dunia kamu, dari penciptaan sampai kini."
        />
      ) : (
        <ol className="relative ml-3 space-y-8 border-l border-border pl-8">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span
                className="absolute -left-[41px] top-1.5 size-3 rounded-full border-2 border-primary bg-background"
                aria-hidden
              />
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{event.date}</p>
              <h2 className="font-serif text-xl">{event.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{event.description}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
