import type { MenuProduct } from "@/lib/types/menu-product";

type MenuProductCardProps = {
  product: MenuProduct;
  onSelect: () => void;
};

export function MenuProductCard({ product, onSelect }: MenuProductCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-square w-full bg-zinc-100">
        {product.category === "signature" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
            <span className="text-xs font-medium text-zinc-400">이미지 없음</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- 로컬 SVG·추후 교체 이미지 */
          <img
            src={product.imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        {product.icedOnly ? (
          <span className="absolute right-2 top-2 rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Only Iced
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
          {product.name}
        </p>
        <p className="text-sm font-semibold tabular-nums text-zinc-600">
          {product.basePriceWon.toLocaleString("ko-KR")}원~
        </p>
      </div>
    </button>
  );
}
