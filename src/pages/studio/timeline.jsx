import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";

import { timelineService, universeService } from "@/services/mock-api";
import { eventSchema } from "@/schemas/lore-schema";
import { cn, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CanonBadge } from "@/components/ui/badge";

/**
 * TimelinePage — the editorial vertical chronology (§9.7).
 *
 * Not a table with a date column: a single hairline rule down the left, a
 * diamond at each event (brass for canon, moss for draft, hollow for legend),
 * and era names set as section dividers so the page has rhythm.
 */
export function TimelinePage() {
  const { universeId } = useParams();

  const [universe, setUniverse] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { era: "", date: "", title: "", description: "" },
  });

  useEffect(() => {
    let active = true;

    Promise.all([universeService.get(universeId), timelineService.list(universeId)])
      .then(([universeData, eventData]) => {
        if (!active) return;
        if (!universeData) throw new Error("That universe could not be found.");
        setUniverse(universeData);
        setEvents(eventData);
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
  }, [universeId]);

  // Group by era, preserving the order the eras first appear in.
  const eras = useMemo(() => {
    const order = [];
    const grouped = new Map();

    for (const event of events) {
      if (!grouped.has(event.era)) {
        grouped.set(event.era, []);
        order.push(event.era);
      }
      grouped.get(event.era).push(event);
    }

    return order.map((era) => ({ era, items: grouped.get(era) }));
  }, [events]);

  async function onSubmit(values) {
    setFormError(null);

    try {
      const created = await timelineService.create(universeId, values);
      setEvents((current) => [...current, created]);
      setIsDialogOpen(false);
      reset();
    } catch (requestError) {
      setFormError(requestError.message ?? "The event could not be added.");
    }
  }

  if (error) {
    return (
      <>
        <PageHeader overline="Create / Worldbuilding / Timeline" title="Timeline" />
        <ErrorState title="Timeline unavailable" message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Create / Worldbuilding / Timeline"
        title="Timeline"
        description={
          universe
            ? `The chronology of ${universe.name} — ${pluralize(events.length, "event", "events")} across ${pluralize(eras.length, "era", "eras")}.`
            : "Loading the chronology…"
        }
        backTo={`/studio/worlds/${universeId}`}
        backLabel="World overview"
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New Event
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState variant="prose" label="Loading timeline…" />
      ) : events.length === 0 ? (
        <EmptyState
          title="The history of this world is unwritten"
          description="Add the first event — a founding, a war, a gate that was never on the plan."
          action={<Button onClick={() => setIsDialogOpen(true)}>Add the first event</Button>}
        />
      ) : (
        <div className="max-w-[760px]">
          {eras.map(({ era, items }) => (
            <section key={era} className="mb-12 last:mb-0">
              {/* Era divider: rule + overline, the page's editorial rhythm. */}
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <h2 className="overline shrink-0 text-brass">{era}</h2>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>

              <ol className="mt-6 border-l border-border pl-6">
                {items.map((event) => (
                  <li key={event.id} className="relative pb-9 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -left-[25px] top-1.5 size-2 -translate-x-1/2 rotate-45",
                        event.canon === "canon"
                          ? "bg-brass"
                          : event.canon === "legend"
                            ? "border border-ink-faint bg-paper"
                            : "bg-brass-quiet",
                      )}
                    />

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                        {event.date}
                      </p>
                      <CanonBadge status={event.canon} />
                    </div>

                    <h3 className="mt-1.5 font-serif text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug text-ink">
                      {event.title}
                    </h3>

                    <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-[1.7] text-ink-muted">
                      {event.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setFormError(null);
            reset();
          }
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>New timeline event</DialogTitle>
            <DialogDescription>
              An era, a date, and what happened. The era name becomes a section divider.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Era" htmlFor="eventEra" error={errors.era?.message}>
                <Input
                  id="eventEra"
                  placeholder="The Sail Wars"
                  invalid={Boolean(errors.era)}
                  {...register("era")}
                />
              </Field>

              <Field label="Date" htmlFor="eventDate" error={errors.date?.message}>
                <Input
                  id="eventDate"
                  placeholder="Year 214"
                  invalid={Boolean(errors.date)}
                  {...register("date")}
                />
              </Field>
            </div>

            <Field label="Title" htmlFor="eventTitle" error={errors.title?.message}>
              <Input
                id="eventTitle"
                placeholder="The War of Three Sails"
                invalid={Boolean(errors.title)}
                {...register("title")}
              />
            </Field>

            <Field label="Description" htmlFor="eventDescription" error={errors.description?.message}>
              <Textarea
                id="eventDescription"
                rows={3}
                maxLength={400}
                placeholder="What changed, and who was there to see it."
                invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </Field>

            {formError ? (
              <p role="alert" className="border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert">
                {formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Adding…
                  </>
                ) : (
                  "Add Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
