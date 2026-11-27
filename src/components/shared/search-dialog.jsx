import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { CornerDownLeft, Search, UserRound } from "lucide-react";

import { creatorService, storyService } from "@/services/mock-api";
import { StoryCover } from "@/components/shared/story-cover";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Global search over published stories and creators. Frontend-only: it queries
 * the same services the pages use, so results match this session's archive.
 */
export function SearchDialog({ open, onOpenChange }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [stories, setStories] = useState([]);
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;

    Promise.all([storyService.listPublished(), creatorService.list()])
      .then(([storyData, creatorData]) => {
        if (!active) return;
        setStories(storyData);
        setCreators(creatorData);
      })
      .catch(() => {
        if (!active) return;
        setStories([]);
        setCreators([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [version]);

  const term = query.trim().toLowerCase();

  const storyResults = useMemo(() => {
    if (!term) return stories.slice(0, 4);
    return stories
      .filter(
        (story) =>
          story.title.toLowerCase().includes(term) ||
          story.synopsis.toLowerCase().includes(term) ||
          story.genre.toLowerCase().includes(term) ||
          story.author?.name.toLowerCase().includes(term) ||
          story.tags.some((tag) => tag.includes(term)),
      )
      .slice(0, 6);
  }, [stories, term]);

  const creatorResults = useMemo(() => {
    if (!term) return creators.slice(0, 3);
    return creators
      .filter(
        (creator) =>
          creator.name.toLowerCase().includes(term) ||
          creator.handle.includes(term) ||
          creator.bio.toLowerCase().includes(term),
      )
      .slice(0, 3);
  }, [creators, term]);

  function go(path) {
    onOpenChange(false);
    setQuery("");
    navigate(path);
  }

  function handleOpenChange(next) {
    if (next) {
      setIsLoading(true);
      setVersion((current) => current + 1);
    } else {
      setQuery("");
    }
    onOpenChange(next);
  }

  function onKeyDown(event) {
    if (event.key !== "Enter") return;
    const first = storyResults[0];
    if (first) go(`/stories/${first.slug}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="top-[10%] max-w-[620px] translate-y-0 gap-0 border-ink p-0"
        showClose={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search Lorekeeper</DialogTitle>
        <DialogDescription className="sr-only">
          Find stories by title, genre, tag or author, and creators by name.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search stories, genres, authors…"
            aria-label="Search stories and creators"
            className="h-14 w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />

          <kbd className="hidden shrink-0 border border-border-strong px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-2">
          <p className="overline px-2 py-2 text-ink-faint">
            {term ? "Stories" : "Recently published"}
          </p>

          {isLoading ? (
            <div className="space-y-3 px-2 py-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : storyResults.length === 0 ? (
            <p className="px-2 py-3 text-[13px] text-ink-muted">
              No story matches “{query.trim()}”.
            </p>
          ) : (
            storyResults.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => go(`/stories/${story.slug}`)}
                className="flex w-full items-center gap-3 rounded-[2px] px-2 py-2.5 text-left transition-colors hover:bg-paper-muted"
              >
                <span className="w-7 shrink-0">
                  <StoryCover story={story} size="xs" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-[15px] text-ink">
                    {story.title}
                  </span>
                  <span className="block truncate text-[12px] text-ink-muted">
                    {story.genre} · {story.author?.name}
                  </span>
                </span>

                <CornerDownLeft className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
              </button>
            ))
          )}

          {creatorResults.length > 0 ? (
            <>
              <p className="overline px-2 pb-2 pt-4 text-ink-faint">Creators</p>

              {creatorResults.map((creator) => (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => go(`/creators/${creator.handle}`)}
                  className="flex w-full items-center gap-3 rounded-[2px] px-2 py-2.5 text-left transition-colors hover:bg-paper-muted"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center border border-border-strong">
                    <UserRound className="size-3.5 text-ink-faint" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[15px] text-ink">
                      {creator.name}
                    </span>
                    <span className="block truncate text-[12px] text-ink-muted">
                      @{creator.handle}
                    </span>
                  </span>
                </button>
              ))}
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-[11px] text-ink-faint">
          <span>Search covers this browser&apos;s archive.</span>
          <span className="hidden sm:inline">Enter opens the first story</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
