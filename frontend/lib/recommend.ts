import type { Mood, Track } from "@/lib/types";

const CATALOG: Record<Mood, Track[]> = {
  快乐: [
    { id: "happy-1", title: "Sunny Drive", artist: "Nova", duration: 186 },
    { id: "happy-2", title: "Smiling Skies", artist: "Aster", duration: 202 },
    { id: "happy-3", title: "Candy Road", artist: "Luna Park", duration: 178 },
  ],
  开心: [
    { id: "joy-1", title: "Bubble Tea", artist: "Mellow Fox", duration: 192 },
    { id: "joy-2", title: "Little Sunshine", artist: "Yoyo", duration: 205 },
    { id: "joy-3", title: "Sweet Steps", artist: "Poppy", duration: 184 },
  ],
  放松: [
    { id: "relax-1", title: "Lake Breeze", artist: "Calma", duration: 240 },
    { id: "relax-2", title: "Tea & Clouds", artist: "Eunoia", duration: 228 },
    { id: "relax-3", title: "Silk Paths", artist: "Quiet Trio", duration: 216 },
  ],
  宁静: [
    { id: "peace-1", title: "Moonlit Garden", artist: "Sora", duration: 231 },
    { id: "peace-2", title: "Ink & Mist", artist: "Shan", duration: 214 },
    { id: "peace-3", title: "Far Lanterns", artist: "Kai", duration: 247 },
  ],
  怀旧: [
    { id: "nost-1", title: "Old Streets", artist: "Retro Bus", duration: 210 },
    { id: "nost-2", title: "Polaroid Days", artist: "Zine", duration: 199 },
    { id: "nost-3", title: "Cassette Stars", artist: "Beta", duration: 188 },
  ],
  惊喜: [
    { id: "surp-1", title: "Sparkles", artist: "Blink", duration: 176 },
    { id: "surp-2", title: "Fireworks", artist: "Shine", duration: 203 },
    { id: "surp-3", title: "Hidden Gift", artist: "Juno", duration: 190 },
  ],
  治愈: [
    { id: "heal-1", title: "Warm Blanket", artist: "Cotton Field", duration: 225 },
    { id: "heal-2", title: "Honey Light", artist: "Aurora", duration: 233 },
    { id: "heal-3", title: "Tender Sea", artist: "Loam", duration: 218 },
  ],
  伤感: [
    { id: "sad-1", title: "Rain on Glass", artist: "Blue Room", duration: 245 },
    { id: "sad-2", title: "Grey Letters", artist: "Postmark", duration: 238 },
    { id: "sad-3", title: "Midnight Tram", artist: "North 3", duration: 252 },
  ],
  孤独: [
    { id: "alone-1", title: "Solitary Road", artist: "Hollow", duration: 236 },
    { id: "alone-2", title: "Empty Station", artist: "City Echoes", duration: 221 },
    { id: "alone-3", title: "Low Moon", artist: "Dune", duration: 229 },
  ],
  沉思: [
    { id: "think-1", title: "Notes & Silence", artist: "Mindfield", duration: 260 },
    { id: "think-2", title: "Slow Orbit", artist: "Zenith", duration: 248 },
    { id: "think-3", title: "Lines in Sand", artist: "Paradox", duration: 241 },
  ],
  疲惫: [
    { id: "tired-1", title: "Soft Pillow", artist: "Blank Page", duration: 224 },
    { id: "tired-2", title: "Dim Lights", artist: "Late Night", duration: 232 },
    { id: "tired-3", title: "Slow Train", artist: "Cloud Nine", duration: 219 },
  ],
  激动: [
    { id: "excite-1", title: "Neon Pulse", artist: "VOLT", duration: 198 },
    { id: "excite-2", title: "Rush Hour", artist: "Metro", duration: 206 },
    { id: "excite-3", title: "Sky Run", artist: "Helios", duration: 201 },
  ],
  兴奋: [
    { id: "thrill-1", title: "Spark Rush", artist: "Cinder", duration: 194 },
    { id: "thrill-2", title: "Jetstream", artist: "Aerial", duration: 209 },
    { id: "thrill-3", title: "Flash Line", artist: "Ion", duration: 187 },
  ],
};

export function recommendTracks(mood: Mood): Track[] {
  return CATALOG[mood] ?? [];
}
