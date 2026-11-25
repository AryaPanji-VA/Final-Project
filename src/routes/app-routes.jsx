import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { AuthLayout } from "@/layouts/dashboard-layout";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "./protected-route";

import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { MyUniversesPage } from "@/pages/universes/my-universes";
import { CreateUniversePage } from "@/pages/universes/create-universe";
import { UniverseOverviewPage } from "@/pages/universes/universe-overview";
import { LoreEncyclopediaPage } from "@/pages/lore/lore-encyclopedia";
import { LoreEditorPage } from "@/pages/lore/lore-editor";
import { TimelinePage } from "@/pages/timeline/timeline";
import { DiscoverPage } from "@/pages/discover/discover";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/universes" element={<MyUniversesPage />} />
            <Route path="/universes/create" element={<CreateUniversePage />} />
            <Route path="/universes/:universeId" element={<UniverseOverviewPage />} />
            <Route path="/universes/:universeId/lore" element={<LoreEncyclopediaPage />} />
            <Route path="/universes/:universeId/lore/:loreId/edit" element={<LoreEditorPage />} />
            <Route path="/universes/:universeId/timeline" element={<TimelinePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Route>
        </Route>

        {/* Auth di luar dashboard */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
