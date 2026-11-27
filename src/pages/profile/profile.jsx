import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check, LoaderCircle, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { storyService, universeService } from "@/services/mock-api";
import { formatDate, getInitials, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Overline } from "@/components/ui/card";

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [universes, setUniverses] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([universeService.list(), storyService.listMine()])
      .then(([universeData, storyData]) => {
        if (!active) return;
        setUniverses(universeData);
        setStories(storyData);
      })
      .catch(() => {
        if (active) {
          setUniverses([]);
          setStories([]);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const publicCount = universes.filter((universe) => universe.visibility === "public").length;
  const totalEntries = universes.reduce((sum, universe) => sum + universe.entries, 0);

  // Frontend-only: the name is written to local storage and to the auth
  // context, so the header updates immediately without a reload.
  async function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    updateProfile({ name: name.trim() });
    await new Promise((resolve) => setTimeout(resolve, 320));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <PageHeader
        overline="Account / Profile"
        title="Profile"
        description="How you appear across the archive — on story covers, universe plates, and in the header."
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
        <div className="min-w-0">
          <div className="flex items-center gap-5 border-b border-border pb-6">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center border border-border-strong font-ui text-[21px] font-semibold text-crimson"
            >
              {getInitials(name || user?.name)}
            </span>

            <div className="min-w-0">
              <p className="truncate type-display text-[20px] leading-tight text-ink">
                {name || "Unnamed keeper"}
              </p>
              <p className="mt-1 truncate text-[13px] text-ink-muted">
                {user?.email ?? "no email on record"}
              </p>
            </div>
          </div>

          <form className="mt-8 max-w-[520px] space-y-5" onSubmit={handleSave} noValidate>
            <Field
              label="Display name"
              htmlFor="displayName"
              hint="Shown on the stories and universes you publish."
            >
              <Input
                id="displayName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </Field>

            <Field
              label="Email"
              htmlFor="profileEmail"
              hint="Changing an email address requires a backend."
            >
              <Input id="profileEmail" value={user?.email ?? ""} readOnly disabled />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={!name.trim() || isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>

              {saved ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] text-positive">
                  <Check className="size-4" aria-hidden="true" />
                  Saved
                </span>
              ) : null}
            </div>
          </form>
        </div>

        <aside className="min-w-0">
          <Overline className="border-b border-border pb-2">Your archive</Overline>

          {isLoading ? (
            <div className="mt-4">
              <LoadingState variant="stats" />
            </div>
          ) : (
            <dl className="mt-4 divide-y divide-border">
              {[
                ["Universes", universes.length],
                ["Public worlds", publicCount],
                ["Lore entries", totalEntries],
                ["Stories", stories.length],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 py-2.5">
                  <dt className="text-[13px] text-ink-muted">{label}</dt>
                  <dd className="type-display text-[18px] leading-none text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-relaxed text-ink-faint">
            {pluralize(universes.length, "universe")} in this browser · member since{" "}
            {formatDate(user?.joined ?? "2026-11-27")}
          </p>

          <Button
            variant="destructive"
            size="sm"
            className="mt-6 w-full"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </aside>
      </div>
    </>
  );
}
