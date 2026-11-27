import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { GENRES, VISIBILITIES, universeSchema } from "@/schemas/universe-schema";
import { universeService } from "@/services/mock-api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Overline } from "@/components/ui/card";

/**
 * CreateUniversePage — a single 720px column, the way a printed form is set:
 * label above control, one idea per field, the description last because it is
 * the only field that asks the writer to think.
 */
export function CreateUniversePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(universeSchema),
    defaultValues: { name: "", genre: "", visibility: "private", description: "" },
    mode: "onBlur",
  });

  const description = useWatch({ control, name: "description" }) ?? "";

  async function onSubmit(values) {
    setServerError(null);

    try {
      const created = await universeService.create(values);
      navigate(`/studio/worlds/${created.id}`, { replace: true });
    } catch (error) {
      setServerError(error.message ?? "The universe could not be created.");
    }
  }

  return (
    <>
      <PageHeader
        overline="Create / Worldbuilding"
        title="New Universe"
        description="A name, a genre, and one sentence that places a reader inside the world. Everything else is catalogued afterwards."
        backTo="/studio/worlds"
        backLabel="All universes"
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_260px] lg:gap-16">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-[620px]">
          <div className="space-y-5">
            <Field
              label="Name"
              htmlFor="name"
              error={errors.name?.message}
              hint="The name shown on the plate and in Discover."
            >
              <Input
                id="name"
                placeholder="e.g. Aethermoor"
                className="h-11 font-serif text-[17px]"
                invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Genre" htmlFor="genre" error={errors.genre?.message}>
                <Select id="genre" invalid={Boolean(errors.genre)} {...register("genre")}>
                  <option value="">Choose a genre…</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Visibility" htmlFor="visibility" error={errors.visibility?.message}>
                <Select id="visibility" {...register("visibility")}>
                  {VISIBILITIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
              hint={`${description.length}/500 characters — the index shows the first two lines`}
            >
              <Textarea
                id="description"
                rows={5}
                maxLength={500}
                placeholder="A coastal city where the fog arrives on schedule and leaves with someone."
                invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </Field>
          </div>

          {serverError ? (
            <p
              role="alert"
              className="mt-5 border-l-2 border-alert bg-alert/5 py-2 pl-3 text-[13px] text-alert"
            >
              {serverError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-ink-faint">
              Saved in this browser only — nothing is written to a server.
            </p>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/studio/worlds")}>
                Cancel
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  "Create Universe"
                )}
              </Button>
            </div>
          </div>
        </form>

        <aside>
          <Overline className="border-b border-border pb-2">What happens next</Overline>

          <ol className="mt-4 space-y-4 text-[13px] leading-relaxed text-ink-muted">
            <li>
              <span className="font-mono text-[11px] text-ink-faint">01</span>
              <p className="mt-1">
                The world gets a plate — its initials set large over a survey grid, the way a chart
                is titled.
              </p>
            </li>
            <li>
              <span className="font-mono text-[11px] text-ink-faint">02</span>
              <p className="mt-1">
                You catalogue characters, places, factions, artefacts and myths in the encyclopedia.
              </p>
            </li>
            <li>
              <span className="font-mono text-[11px] text-ink-faint">03</span>
              <p className="mt-1">
                Events go on the timeline, grouped by era, and stories can be set inside the world.
              </p>
            </li>
          </ol>

          <p className="mt-6 border-t border-border pt-3 text-[11.5px] leading-relaxed text-ink-faint">
            Private worlds stay yours. Public worlds appear in Discover and on your creator profile.
          </p>
        </aside>
      </div>
    </>
  );
}
