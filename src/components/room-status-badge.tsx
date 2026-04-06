"use client";

type RoomStatusBadgeProps = {
  /** true = 취합 마감됨 → 모집완료 */
  closed: boolean;
  className?: string;
};

export function RoomStatusBadge({ closed, className = "" }: RoomStatusBadgeProps) {
  if (closed) {
    return (
      <span
        className={`shrink-0 rounded-full bg-zinc-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-50 ${className}`}
      >
        모집완료
      </span>
    );
  }
  return (
    <span
      className={`shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ${className}`}
    >
      모집중
    </span>
  );
}
