import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router";

import { PublicLayout } from "@/layouts/public-layout";
import { WorkspaceLayout } from "@/layouts/workspace-layout";
import { ImmersiveLayout } from "@/layouts/immersive-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { ProtectedRoute } from "./protected-route";
import { RouteFallback } from "./route-fallback";

/**
 * The home, discover and auth pages are the first paint for most visitors, so
 * they load with the shell. Everything else is split: a reader who lands on a
 * story should not download the chapter editor and the campaign board.
 */
import { HomePage } from "@/pages/home/home";
import { DiscoverPage } from "@/pages/discover/discover";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";

const StoriesPage = lazy(() =>
  import("@/pages/stories/stories").then((module) => ({ default: module.StoriesPage })),
);
const StoryDetailPage = lazy(() =>
  import("@/pages/stories/story-detail").then((module) => ({ default: module.StoryDetailPage })),
);
const StoryReaderPage = lazy(() =>
  import("@/pages/stories/story-reader").then((module) => ({ default: module.StoryReaderPage })),
);
const CreatorsPage = lazy(() =>
  import("@/pages/creators/creators").then((module) => ({ default: module.CreatorsPage })),
);
const CreatorProfilePage = lazy(() =>
  import("@/pages/creators/creator-profile").then((module) => ({
    default: module.CreatorProfilePage,
  })),
);
const UniverseDetailPage = lazy(() =>
  import("@/pages/universes/universe-detail").then((module) => ({
    default: module.UniverseDetailPage,
  })),
);

const LibraryPage = lazy(() =>
  import("@/pages/library/library").then((module) => ({ default: module.LibraryPage })),
);
const CreationsPage = lazy(() =>
  import("@/pages/studio/creations").then((module) => ({ default: module.CreationsPage })),
);
const WritingStudioPage = lazy(() =>
  import("@/pages/studio/writing-studio").then((module) => ({ default: module.WritingStudioPage })),
);
const StoryEditorPage = lazy(() =>
  import("@/pages/studio/story-editor").then((module) => ({ default: module.StoryEditorPage })),
);
const ChapterEditorPage = lazy(() =>
  import("@/pages/studio/chapter-editor").then((module) => ({ default: module.ChapterEditorPage })),
);
const WorldsPage = lazy(() =>
  import("@/pages/studio/worlds").then((module) => ({ default: module.WorldsPage })),
);
const CreateUniversePage = lazy(() =>
  import("@/pages/studio/create-universe").then((module) => ({
    default: module.CreateUniversePage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard").then((module) => ({ default: module.DashboardPage })),
);
const WorldDetailPage = lazy(() =>
  import("@/pages/studio/world-detail").then((module) => ({ default: module.WorldDetailPage })),
);
const EncyclopediaPage = lazy(() =>
  import("@/pages/studio/encyclopedia").then((module) => ({ default: module.EncyclopediaPage })),
);
const LoreEditorPage = lazy(() =>
  import("@/pages/studio/lore-editor").then((module) => ({ default: module.LoreEditorPage })),
);
const TimelinePage = lazy(() =>
  import("@/pages/studio/timeline").then((module) => ({ default: module.TimelinePage })),
);
const CampaignsPage = lazy(() =>
  import("@/pages/studio/campaigns").then((module) => ({ default: module.CampaignsPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/profile/profile").then((module) => ({ default: module.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/settings").then((module) => ({ default: module.SettingsPage })),
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public, editorial shell */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:slug" element={<StoryDetailPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/creators/:handle" element={<CreatorProfilePage />} />
            <Route path="/universes/:universeId" element={<UniverseDetailPage />} />
          </Route>

          {/* Immersive reader */}
          <Route element={<ImmersiveLayout />}>
            <Route path="/stories/:slug/read/:chapterId" element={<StoryReaderPage />} />
          </Route>

          {/* Authenticated workspace */}
          <Route element={<ProtectedRoute />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/studio" element={<CreationsPage />} />

              <Route path="/studio/writing" element={<WritingStudioPage />} />
              <Route path="/studio/writing/new" element={<StoryEditorPage />} />
              <Route path="/studio/writing/:storyId" element={<StoryEditorPage />} />
              <Route
                path="/studio/writing/:storyId/chapter/:chapterId"
                element={<ChapterEditorPage />}
              />

              <Route path="/studio/worlds" element={<WorldsPage />} />
              <Route path="/studio/worlds/new" element={<CreateUniversePage />} />
              <Route path="/studio/worlds/:universeId" element={<WorldDetailPage />} />
              <Route path="/studio/worlds/:universeId/lore" element={<EncyclopediaPage />} />
              <Route path="/studio/worlds/:universeId/lore/new" element={<LoreEditorPage />} />
              <Route path="/studio/worlds/:universeId/lore/:loreId" element={<LoreEditorPage />} />
              <Route path="/studio/worlds/:universeId/timeline" element={<TimelinePage />} />

              <Route path="/studio/campaigns" element={<CampaignsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Auth */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />

          {/* Legacy routes from the universe-first structure: old links keep
              working instead of falling through to the home page. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<WorkspaceLayout />}>
              <Route path="/universes" element={<Navigate to="/studio/worlds" replace />} />
              <Route path="/universes/create" element={<Navigate to="/studio/worlds/new" replace />} />
              <Route path="/universes/:universeId/lore" element={<LegacyLoreRedirect />} />
              <Route path="/universes/:universeId/timeline" element={<LegacyTimelineRedirect />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/** /universes/:id/lore → /studio/worlds/:id/lore, preserving the id. */
function LegacyLoreRedirect() {
  const { universeId } = useParams();
  return <Navigate to={`/studio/worlds/${universeId}/lore`} replace />;
}

/** /universes/:id/timeline → /studio/worlds/:id/timeline. */
function LegacyTimelineRedirect() {
  const { universeId } = useParams();
  return <Navigate to={`/studio/worlds/${universeId}/timeline`} replace />;
}
