// Central API configuration. Point VITE_API_BASE_URL at a real backend and the
// fetch helper below starts working without touching the services.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Thin fetch wrapper. There is no backend in this build, so the services read
// from the mock store; this helper is ready for when one exists.
export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again shortly.`);
  }
  return response.json();
}
