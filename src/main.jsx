import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { AuthProvider } from "./hooks/use-auth.jsx";
import { AppRoutes } from "./routes/app-routes.jsx";

// Restore the reduce-motion preference before the first paint so nothing
// animates in when the user has asked for stillness.
if (localStorage.getItem("lorekeeper_reduce_motion") === "true") {
  document.documentElement.dataset.reduceMotion = "true";
}

/**
 * The paper-grain layer (§4). One fixed element above all content and below
 * dialogs. It is a sibling of #root so React never re-renders it, and it is
 * inert to pointers and screen readers.
 */
const grain = document.createElement("div");
grain.className = "grain";
grain.setAttribute("aria-hidden", "true");
document.body.append(grain);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </StrictMode>,
);
