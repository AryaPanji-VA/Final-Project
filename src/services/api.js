// Konfigurasi API terpusat. Nanti tinggal ganti VITE_API_BASE_URL
// ke backend asli (lihat Runbook WAD Minggu 4: URL API disimpan di satu file).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Helper fetch sederhana. Backend belum ada, jadi service di bawah
// masih memakai data tiruan; helper ini siap dipakai saat backend jadi.
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
    throw new Error(`Permintaan gagal (${response.status}). Coba lagi sebentar.`);
  }
  return response.json();
}
