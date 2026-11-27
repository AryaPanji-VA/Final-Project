import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Check, Download, LoaderCircle, Moon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  campaignService,
  loreService,
  resetArchive,
  storyService,
  timelineService,
  universeService,
} from "@/services/mock-api";
import { downloadJson, pluralize } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/card";

const MOTION_KEY = "lorekeeper_reduce_motion";

function SettingRow({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 sm:max-w-[52ch]">
        <p className="text-[14px] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();

  const [universeCount, setUniverseCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem(MOTION_KEY) === "true",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    let active = true;

    universeService
      .list()
      .then((data) => {
        if (active) setUniverseCount(data.length);
      })
      .catch(() => {
        if (active) setUniverseCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  // Reflect the preference on <html> so the global CSS rule applies.
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
    localStorage.setItem(MOTION_KEY, String(reduceMotion));
  }, [reduceMotion]);

  async function handleExport() {
    setIsExporting(true);
    setExported(false);

    try {
      const [universes, lore, events, stories, campaigns] = await Promise.all([
        universeService.list(),
        loreService.list(),
        timelineService.list(),
        storyService.listMine(),
        campaignService.list(),
      ]);

      downloadJson("lorekeeper-archive.json", {
        exportedAt: new Date().toISOString(),
        keeper: user?.name ?? null,
        universes,
        lore,
        timeline: events,
        stories,
        campaigns,
      });

      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        overline="Account / Settings"
        title="Settings"
        description="How the archive behaves in this browser. Nothing here is stored on a server."
      />

      <div className="max-w-[760px]">
        <section>
          <Overline className="mb-2">Reading &amp; motion</Overline>

          <SettingRow
            title="Reduce motion"
            description="Turn off cover lifts, clip reveals, and drawer transitions. Your operating system's reduced-motion setting is respected automatically, whether or not this is on."
          >
            <Button
              variant={reduceMotion ? "quiet" : "outline"}
              size="sm"
              onClick={() => setReduceMotion((value) => !value)}
              aria-pressed={reduceMotion}
            >
              <Moon className="size-4" aria-hidden="true" />
              {reduceMotion ? "Motion reduced" : "Reduce motion"}
            </Button>
          </SettingRow>
        </section>

        <section className="mt-10">
          <Overline className="mb-2">Archive</Overline>

          <SettingRow
            title="Export archive"
            description={`Download ${pluralize(universeCount, "universe")}, every lore entry, timeline event, story and campaign as a single JSON file.`}
          >
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Preparing…
                </>
              ) : exported ? (
                <>
                  <Check className="size-4 text-positive" aria-hidden="true" />
                  Exported
                </>
              ) : (
                <>
                  <Download className="size-4" aria-hidden="true" />
                  Export JSON
                </>
              )}
            </Button>
          </SettingRow>

          <SettingRow
            title="Storage"
            description="This build runs on mock services. Your stories, universes, entries and campaigns are saved in this browser only — not on a server."
          >
            <span className="label-box border-border-strong text-ink-faint">This browser</span>
          </SettingRow>

          <SettingRow
            title="Reset archive"
            description="Discard everything you have added in this browser and return to the seeded archive. Your account stays signed in."
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm("Discard every local change and restore the seed archive?")) {
                  resetArchive();
                }
              }}
            >
              Reset to seed
            </Button>
          </SettingRow>
        </section>

        <section className="mt-10">
          <Overline className="mb-2">Account</Overline>

          <SettingRow
            title="Profile"
            description="Change the name shown on your stories, universe plates, and in the header."
          >
            <Button variant="outline" size="sm" asChild>
              <Link to="/profile">Open profile</Link>
            </Button>
          </SettingRow>

          <SettingRow
            title="Membership"
            description="Signed in as the mock keeper account for this browser session."
          >
            <span className="text-[12px] text-ink-faint">{user?.email ?? "—"}</span>
          </SettingRow>
        </section>
      </div>
    </>
  );
}
