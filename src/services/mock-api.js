import { apiFetch } from "./api";

// --- Auth tiruan (Minggu 4: login mock, nanti diganti backend asli) ---
const TOKEN_KEY = "lorekeeper_token";
const USER_KEY = "lorekeeper_user";

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login({ email }) {
  await delay();
  // Mock: semua email + password (min 8 karakter) diterima.
  const user = {
    id: "u-1",
    name: email.split("@")[0],
    email,
  };
  const token = `mock-token-${crypto.randomUUID()}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export async function register({ name, email }) {
  await delay();
  const user = { id: "u-1", name, email };
  const token = `mock-token-${crypto.randomUUID()}`;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- Data tiruan universes & lore (JSONPlaceholder-style mock) ---
const mockUniverses = [
  {
    id: "unv-1",
    name: "Aethermoor",
    genre: "High Fantasy",
    description: "Dunia kepulauan yang melayang di atas lautan awan abadi.",
    entries: 24,
    updatedAt: "2026-11-20",
  },
  {
    id: "unv-2",
    name: "Vesper Station",
    genre: "Sci-Fi",
    description: "Stasiun riset orbital terakhir manusia menjelang senja matahari.",
    entries: 15,
    updatedAt: "2026-11-18",
  },
  {
    id: "unv-3",
    name: "Kota Sembilan Gerbang",
    genre: "Urban Fantasy",
    description: "Metropolis pesisir tempat mitos kuno hidup di balik apartemen sewa.",
    entries: 31,
    updatedAt: "2026-11-22",
  },
];

const mockLore = [
  { id: "lore-1", universeId: "unv-1", title: "Ordo Penjaga Angin", category: "Faction", summary: "Kesatria yang menambatkan pulau dengan layar raksasa." },
  { id: "lore-2", universeId: "unv-1", title: "Lautan Awan", category: "Location", summary: "Samudra uap yang menjadi dasar seluruh kepulauan." },
  { id: "lore-3", universeId: "unv-1", title: "Kristal Lentera", category: "Artifact", summary: "Sumber cahaya yang menyimpan memori leluhur." },
  { id: "lore-4", universeId: "unv-2", title: "Protokol Senja", category: "Event", summary: "Upacara terakhir sebelum stasiun memasuki orbit gelap." },
  { id: "lore-5", universeId: "unv-2", title: "Dr. Ilsa Marek", category: "Character", summary: "Kepala botani stasiun yang tak pernah tidur." },
  { id: "lore-6", universeId: "unv-3", title: "Gerbang Ketujuh", category: "Location", summary: "Pintu bawah tanah yang hanya terbuka saat kabut pasang." },
];

const mockTimeline = [
  { id: "ev-1", universeId: "unv-1", date: "Tahun 0", title: "Kebangkitan Pulau", description: "Kepulauan pertama terlepas dari benua Indral." },
  { id: "ev-2", universeId: "unv-1", date: "Tahun 214", title: "Perang Tiga Layar", description: "Ordo Penjaga Angin mempertahankan langit dari armada Torgath." },
  { id: "ev-3", universeId: "unv-1", date: "Tahun 512", title: "Zaman Lentera", description: "Kristal Lentera ditemukan dan mengubah cara pulau bercahaya." },
];

// Service data. Saat backend siap, tiap fungsi tinggal diganti apiFetch().
export const universeService = {
  async list() {
    await delay();
    return mockUniverses;
  },
  async get(id) {
    await delay();
    return mockUniverses.find((universe) => universe.id === id) ?? null;
  },
};

export const loreService = {
  async list(universeId) {
    await delay();
    return universeId ? mockLore.filter((entry) => entry.universeId === universeId) : mockLore;
  },
};

export const timelineService = {
  async list(universeId) {
    await delay();
    return universeId ? mockTimeline.filter((event) => event.universeId === universeId) : mockTimeline;
  },
};

export const discoverService = {
  async listPublic() {
    await delay();
    return mockUniverses.map((universe) => ({ ...universe, owner: "penjaga-lore" }));
  },
};

export { apiFetch };
