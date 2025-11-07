// Removed: front-end recommendation catalog is deprecated and no longer used.
// This file is intentionally left with a hard error to prevent accidental imports.
export function recommendTracks(): never {
  throw new Error("recommend.ts has been removed. Use backend FastAPI /recommend instead.");
}
