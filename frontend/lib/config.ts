// Runtime configuration helpers for routing and DB-related behaviors
// Only NEXT_PUBLIC_* variables are available on the client. Server can read non-public ones.

export const USE_DB: boolean = (() => {
  const v = (process.env.NEXT_PUBLIC_USE_DB ?? process.env.USE_DB ?? "true").toString().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
})();

export const CURRENT_USER_ID: number = (() => {
  const v = process.env.NEXT_PUBLIC_USER_ID ?? process.env.CURRENT_USER_ID ?? "1";
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 1;
})();

// Backend (FastAPI) base URL for recommendations
export const BACKEND_BASE_URL: string = (() => {
  const v = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000";
  return v.replace(/\/$/, "");
})();

// Centralized diary detail href builder so all entry points stay consistent
export function buildDiaryHref(id: string): string {
  const safe = encodeURIComponent(String(id ?? "").trim());
  // Keep path-style routing; if future needs vary by config, switch here in one place.
  return `/diary/${safe}`;
}
