import type { Mood } from "@/lib/types";

const MOOD_STYLES: Partial<Record<Mood, { bg: string; text: string; ring: string }>> = {
  快乐: { bg: "bg-gradient-to-r from-amber-400 to-pink-400", text: "text-white", ring: "ring-amber-300/50" },
  开心: { bg: "bg-gradient-to-r from-amber-400 to-rose-400", text: "text-white", ring: "ring-amber-300/50" },
  放松: { bg: "bg-gradient-to-r from-teal-400 to-sky-400", text: "text-white", ring: "ring-teal-300/50" },
  宁静: { bg: "bg-gradient-to-r from-teal-500 to-emerald-500", text: "text-white", ring: "ring-teal-300/50" },
  怀旧: { bg: "bg-gradient-to-r from-fuchsia-400 to-rose-400", text: "text-white", ring: "ring-fuchsia-300/50" },
  惊喜: { bg: "bg-gradient-to-r from-violet-400 to-pink-400", text: "text-white", ring: "ring-violet-300/50" },
  治愈: { bg: "bg-gradient-to-r from-green-400 to-emerald-500", text: "text-white", ring: "ring-green-300/50" },
  伤感: { bg: "bg-gradient-to-r from-slate-500 to-zinc-600", text: "text-white", ring: "ring-slate-300/50" },
  孤独: { bg: "bg-gradient-to-r from-indigo-500 to-blue-500", text: "text-white", ring: "ring-indigo-300/50" },
  沉思: { bg: "bg-gradient-to-r from-cyan-500 to-blue-500", text: "text-white", ring: "ring-cyan-300/50" },
  疲惫: { bg: "bg-gradient-to-r from-zinc-400 to-slate-500", text: "text-white", ring: "ring-zinc-300/50" },
  激动: { bg: "bg-gradient-to-r from-red-500 to-orange-500", text: "text-white", ring: "ring-red-300/50" },
  兴奋: { bg: "bg-gradient-to-r from-orange-400 to-amber-500", text: "text-white", ring: "ring-orange-300/50" },
};

export default function MoodBadge({ mood }: { mood: Mood }) {
  const s = MOOD_STYLES[mood] ?? { bg: "bg-brand-700", text: "text-white", ring: "ring-brand-300/50" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${s.bg} ${s.text} ${s.ring} px-2 py-0.5 text-xs font-medium ring-2`}>
      {mood}
    </span>
  );
}
