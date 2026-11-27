import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, ScrollText, Swords, UserRound } from "lucide-react";
import { z } from "zod";

import { campaignService, universeService } from "@/services/mock-api";
import { cn, formatRelativeDate, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHead } from "@/components/shared/section-head";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Overline } from "@/components/ui/card";

const campaignSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80, "Title is too long"),
  system: z.string().min(1, "Name the ruleset, or choose system agnostic"),
  universeId: z.string().optional(),
  description: z
    .string()
    .min(20, "Describe the campaign in at least 20 characters")
    .max(400, "Description must be 400 characters or fewer"),
});

const QUEST_STATUS = {
  complete: "positive",
  active: "arcaneQuiet",
  unstarted: "outline",
};

/**
 * CampaignsPage — the RPG Studio (§9.8).
 *
 * A game master's workspace, not a virtual tabletop: a campaign index on the
 * left, and the selected campaign's setting, quest board, cast and session log
 * on the right. Read-only beyond campaign creation, which is wired to the mock
 * service and honestly labelled as session-scoped.
 */
export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [universes, setUniverses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: { title: "", system: "D&D 5e", universeId: "", description: "" },
  });

  useEffect(() => {
    let active = true;

    Promise.all([campaignService.list(), universeService.list()])
      .then(([campaignData, universeData]) => {
        if (!active) return;
        setCampaigns(campaignData);
        setUniverses(universeData);
        setSelectedId(campaignData[0]?.id ?? null);
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

  const selected = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedId) ?? null,
    [campaigns, selectedId],
  );

  async function onSubmit(values) {
    setCreateError(null);

    try {
      const created = await campaignService.create({
        ...values,
        universeId: values.universeId || null,
      });

      setCampaigns((current) => [{ ...created, universe: null }, ...current]);
      setSelectedId(created.id);
      setIsCreating(false);
      reset();
    } catch (requestError) {
      setCreateError(requestError.message ?? "The campaign could not be created.");
    }
  }

  if (error) {
    return (
      <>
        <PageHeader overline="Create / RPG Studio" title="RPG Studio" />
        <ErrorState title="Campaigns could not be loaded" message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Create / RPG Studio"
        title="RPG Studio"
        description="Campaign workspaces: the setting, the quest board, the cast, and what happened last session."
        actions={
          <Button onClick={() => setIsCreating((value) => !value)} aria-expanded={isCreating}>
            <Plus className="size-4" aria-hidden="true" />
            New Campaign
          </Button>
        }
      />

      {isCreating ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mb-10 max-w-[620px] border border-border bg-surface p-5"
        >
          <Overline className="border-b border-border pb-2">New campaign</Overline>

          <div className="mt-5 space-y-5">
            <Field label="Title" htmlFor="campaignTitle" error={errors.title?.message}>
              <Input
                id="campaignTitle"
                placeholder="e.g. The Forgotten Temple"
                invalid={Boolean(errors.title)}
                {...register("title")}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="System" htmlFor="campaignSystem" error={errors.system?.message}>
                <Select id="campaignSystem" invalid={Boolean(errors.system)} {...register("system")}>
                  <option value="D&D 5e">D&amp;D 5e</option>
                  <option value="System agnostic">System agnostic</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>

              <Field label="Universe" htmlFor="campaignUniverse" optional>
                <Select id="campaignUniverse" {...register("universeId")}>
                  <option value="">No universe</option>
                  {universes.map((universe) => (
                    <option key={universe.id} value={universe.id}>
                      {universe.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Premise" htmlFor="campaignDescription" error={errors.description?.message}>
              <Textarea
                id="campaignDescription"
                rows={3}
                maxLength={400}
                placeholder="What the party is being asked to do, and what it will cost them."
                invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </Field>
          </div>

          {createError ? (
            <p
              role="alert"
              className="mt-4 border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert"
            >
              {createError}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreating(false);
                reset();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <LoadingState variant="rows" count={3} label="Loading campaigns…" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="A campaign starts with a premise and a ruleset. Quests and session notes come after the first session."
          action={<Button onClick={() => setIsCreating(true)}>Start a campaign</Button>}
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
          {/* Campaign index */}
          <nav aria-label="Campaigns" className="min-w-0">
            <Overline className="border-b border-border pb-2">Campaigns</Overline>

            <ul className="divide-y divide-border">
              {campaigns.map((campaign) => {
                const isActive = campaign.id === selectedId;

                return (
                  <li key={campaign.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(campaign.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-start gap-2 border-l-2 py-3 pl-3 text-left transition-colors",
                        isActive
                          ? "border-crimson-bright bg-paper-muted/60"
                          : "border-transparent hover:bg-paper-muted/40",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-ui text-[14px] font-medium leading-snug text-ink">
                          {campaign.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                          {campaign.system} · {pluralize(campaign.sessions, "session")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-[11.5px] leading-relaxed text-ink-faint">
              Campaigns and their notes are saved in this browser only.
            </p>
          </nav>

          {/* Selected campaign */}
          {selected ? (
            <article className="min-w-0">
              <header className="border-b border-border pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{selected.system}</Badge>
                  <StatusBadge status={selected.status === "in progress" ? "published" : "draft"} />
                  {selected.universe ? (
                    <Link
                      to={`/universes/${selected.universe.id}`}
                      className="label-box border-border-strong text-ink-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      {selected.universe.name}
                    </Link>
                  ) : null}
                </div>

                <h2 className="mt-3 font-ui text-[clamp(1.35rem,1.15rem+0.8vw,1.7rem)] font-semibold leading-[1.2] tracking-[-0.012em] text-ink">
                  {selected.title}
                </h2>

                <p className="mt-2 max-w-[62ch] text-[14px] leading-[1.7] text-ink-muted">
                  {selected.description}
                </p>

                {selected.setting ? (
                  <p className="mt-3 border-l-2 border-brass pl-3 font-reading text-[15.5px] italic leading-relaxed text-ink-muted">
                    {selected.setting}
                  </p>
                ) : null}

                <p className="mt-3 text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">
                  {pluralize(selected.sessions, "session")} run · edited{" "}
                  {formatRelativeDate(selected.updatedAt)}
                </p>
              </header>

              {/* Quest board */}
              <section className="mt-8">
                <SectionHead overline="Board" title="Quests" rule={false} />

                {selected.quests.length === 0 ? (
                  <p className="border-b border-border py-6 text-[13px] text-ink-muted">
                    No quests recorded. The board fills up after the first session.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-border border-t border-border">
                    {selected.quests.map((quest) => (
                      <li key={quest.id} className="flex items-center justify-between gap-3 py-3">
                        <span className="min-w-0 font-ui text-[14px] font-medium text-ink">{quest.title}</span>
                        <Badge variant={QUEST_STATUS[quest.status] ?? "outline"}>
                          {quest.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Cast */}
              <section className="mt-12">
                <SectionHead overline="Cast" title="NPCs" rule={false} />

                {selected.npcs.length === 0 ? (
                  <p className="border-b border-border py-6 text-[13px] text-ink-muted">
                    No non-player characters yet.
                  </p>
                ) : (
                  <ul className="mt-2 grid gap-x-10 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-y-0">
                    {selected.npcs.map((npc) => (
                      <li key={npc.id} className="flex items-start gap-3 py-3">
                        <UserRound
                          className="mt-0.5 size-4 shrink-0 text-ink-faint"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block font-ui text-[14px] font-medium text-ink">{npc.name}</span>
                          <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                            {npc.role} · {npc.note}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Session log */}
              <section className="mt-12">
                <SectionHead overline="Log" title="Session notes" rule={false} />

                {selected.notes.length === 0 ? (
                  <p className="border-b border-border py-6 text-[13px] text-ink-muted">
                    Nothing written up yet.
                  </p>
                ) : (
                  <ol className="mt-2 divide-y divide-border border-t border-border">
                    {selected.notes.map((note) => (
                      <li key={note.id} className="py-4">
                        <div className="flex items-baseline gap-3">
                          <span className="type-meta text-ink-faint">
                            Session {String(note.session).padStart(2, "0")}
                          </span>
                          <h3 className="font-ui text-[14.5px] font-semibold text-ink">
                            {note.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 max-w-[66ch] text-[13.5px] leading-relaxed text-ink-muted">
                          {note.body}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <div className="mt-10 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-[12px] text-ink-faint">
                  <ScrollText className="size-3.5" aria-hidden="true" />
                  Quest, NPC and session editing is not wired in this build — creation works, the
                  rest is read from the seed campaign.
                </p>
              </div>
            </article>
          ) : (
            <div className="flex items-center gap-3 text-ink-muted">
              <Swords className="size-5" aria-hidden="true" />
              <p className="text-[14px]">Select a campaign to open its board.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
