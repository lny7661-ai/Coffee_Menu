"use client";

import { X } from "lucide-react";
import { computePrice } from "@/lib/menu";
import type {
  MenuProduct,
  OrderOptions,
  Temperature,
} from "@/lib/types/menu-product";
import {
  DECAF_PRICE,
  EXTRA_SHOT_PRICE,
  MILK_SWAP_PRICE,
} from "@/lib/types/menu-product";

type MenuOptionSheetProps = {
  product: MenuProduct;
  options: OrderOptions;
  open: boolean;
  onClose: () => void;
  onChange: (next: OrderOptions) => void;
  /** 있으면 하단 버튼이 장바구니 담기로 바뀌고, 클릭 시 호출 후 시트 닫힘 */
  onAddToCart?: () => void;
};

function TempButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

export function MenuOptionSheet({
  product,
  options,
  open,
  onClose,
  onChange,
  onAddToCart,
}: MenuOptionSheetProps) {
  if (!open) return null;

  const setTemp = (temperature: Temperature) => {
    onChange({ ...options, temperature });
  };

  const setMilk = (milk: OrderOptions["milk"]) => {
    onChange({ ...options, milk });
  };

  const total = computePrice(product, options);
  const mod = product.modifiers;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-zinc-900/40 p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="option-sheet-title"
    >
      <button
        type="button"
        className="min-h-0 flex-1 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="max-h-[min(92vh,720px)] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
          <h2 id="option-sheet-title" className="text-base font-semibold text-zinc-900">
            옵션 선택
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-6 pt-4">
          <div className="flex gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
              {product.category === "signature" ? (
                <span className="px-1 text-center text-[11px] font-medium leading-tight text-zinc-400">
                  이미지 없음
                </span>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.imageSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{product.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                기본 {product.basePriceWon.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>

          {product.temperatureMode === "both" ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                온도
              </p>
              <div className="mt-2 flex gap-2">
                <TempButton
                  active={options.temperature === "hot"}
                  label="HOT"
                  onClick={() => setTemp("hot")}
                />
                <TempButton
                  active={options.temperature === "ice"}
                  label="ICED"
                  onClick={() => setTemp("ice")}
                />
              </div>
            </div>
          ) : product.temperatureMode === "hotOnly" ? (
            <p className="mt-6 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              핫 전용 음료입니다.
            </p>
          ) : (
            <p className="mt-6 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
              아이스 전용 음료입니다.
            </p>
          )}

          {mod?.milkSwap ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                우유 (+{MILK_SWAP_PRICE.toLocaleString("ko-KR")}원)
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {(
                  [
                    ["regular", "일반우유"],
                    ["soy", "두유"],
                    ["oat", "오트밀크"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50"
                  >
                    <input
                      type="radio"
                      name={`milk-${product.id}`}
                      checked={options.milk === value}
                      onChange={() => setMilk(value)}
                      className="h-4 w-4 accent-zinc-900"
                    />
                    <span className="text-sm font-medium text-zinc-800">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {mod?.extraShot ? (
            <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 px-3 py-3">
              <span className="text-sm font-medium text-zinc-800">
                샷 추가 (+{EXTRA_SHOT_PRICE.toLocaleString("ko-KR")}원)
              </span>
              <input
                type="checkbox"
                checked={options.extraShot}
                onChange={(e) =>
                  onChange({ ...options, extraShot: e.target.checked })
                }
                className="h-5 w-5 rounded accent-zinc-900"
              />
            </label>
          ) : null}

          {mod?.decaf ? (
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 px-3 py-3">
              <span className="text-sm font-medium text-zinc-800">
                디카페인 (+{DECAF_PRICE.toLocaleString("ko-KR")}원)
              </span>
              <input
                type="checkbox"
                checked={options.decaf}
                onChange={(e) =>
                  onChange({ ...options, decaf: e.target.checked })
                }
                className="h-5 w-5 rounded accent-zinc-900"
              />
            </label>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-sm font-medium text-zinc-500">결제 예상</span>
            <span className="text-lg font-bold tabular-nums text-zinc-900">
              {total.toLocaleString("ko-KR")}원
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onAddToCart?.();
              onClose();
            }}
            className="mt-4 w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            {onAddToCart ? "장바구니에 담기" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
