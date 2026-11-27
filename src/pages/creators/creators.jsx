import { useEffect, useState } from "react";

import { creatorService } from "@/services/mock-api";
import { CreatorCard } from "@/components/shared/creator-card";
import { EditorialHeader } from "@/components/shared/section-head";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

export function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    creatorService
      .list()
      .then((data) => {
        if (active) setCreators(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const sorted = [...creators].sort((a, b) => b.followers - a.followers);

  return (
    <>
      <EditorialHeader
        overline="People"
        title="Creators"
        standfirst="Writers, cartographers and game masters publishing in the archive. Follow anyone whose work you want to keep up with."
        meta={<span>{creators.length} creators</span>}
      />

      <div className="py-10">
        {error ? (
          <ErrorState title="Creators could not be loaded" message={error} />
        ) : isLoading ? (
          <LoadingState variant="rows" count={4} label="Loading creators…" />
        ) : (
          <div className="grid grid-cols-1 gap-x-12 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
            {sorted.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
