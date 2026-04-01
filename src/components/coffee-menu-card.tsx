import { Droplets, Snowflake, Flame } from "lucide-react";
import type { MenuItem } from "@/lib/types";

const MILK_BADGE: Record<MenuItem["milkOption"], string> = {
  regular: "일반우유",
  soy: "두유",
  oat: "오트밀크",
};

type CoffeeMenuCardProps = {
  item: MenuItem;
};

export function CoffeeMenuCard({ item }: CoffeeMenuCardProps) {
  const isIce = item.temperature === "ice";

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-stone-900">{item.name}</h3>
        <span className="shrink-0 text-sm font-medium text-amber-800">
          {item.priceWon.toLocaleString("ko-KR")}원
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            isIce
              ? "bg-sky-100 text-sky-900"
              : "bg-orange-100 text-orange-900"
          }`}
        >
          {isIce ? (
            <Snowflake className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Flame className="h-3.5 w-3.5" aria-hidden />
          )}
          {isIce ? "아이스" : "핫"}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-800">
          <Droplets className="h-3.5 w-3.5 text-amber-700" aria-hidden />
          {MILK_BADGE[item.milkOption]}
        </span>
      </div>
    </article>
  );
}
