import type { ReactNode } from "react";
type Props = {
  footprints: number;
  memories: number;
  music: number;
};

export default function MetricsBar({ footprints, memories, music }: Props) {
  const Item = ({
    icon,
    value,
    label,
  }: {
    icon: ReactNode;
    value: number | string;
    label: string;
  }) => (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-200">
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-2xl font-semibold leading-none text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {value}
        </div>
        <div className="mt-1 text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  );

  return (
  <section className="mb-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
      <Item
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="block">
            <path d="M12 22s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11z" />
            <circle cx="12" cy="11" r="3.25" />
          </svg>
        }
        value={footprints}
        label="足迹"
      />
      <span aria-hidden className="hidden h-8 w-px bg-zinc-200 sm:block" />
      <Item
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="block">
            <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
            <path d="M15.5 6.5 14.3 4.5h-4.6L8.5 6.5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
        value={memories}
        label="回忆"
      />
      <span aria-hidden className="hidden h-8 w-px bg-zinc-200 sm:block" />
      <Item
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="block">
            <path d="M12 5v10" />
            <path d="M12 5h6" />
            <circle cx="8.5" cy="16.5" r="3" />
          </svg>
        }
        value={music}
        label="音乐"
      />
    </section>
  );
}
