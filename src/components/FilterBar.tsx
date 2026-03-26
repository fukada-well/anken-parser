"use client";
import { FilterState } from "@/types";

type Props = {
  filters: FilterState;
  locations: string[];
  onChange: (f: FilterState) => void;
  total: number;
  shown: number;
};

export default function FilterBar({ filters, locations, onChange, total, shown }: Props) {
  function set(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-5 py-2.5">
      <input
        type="text"
        placeholder="キーワード検索..."
        value={filters.keyword}
        onChange={(e) => set({ keyword: e.target.value })}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-36"
      />
      <select
        value={filters.location}
        onChange={(e) => set({ location: e.target.value })}
        className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
      >
        <option value="">勤務地: すべて</option>
        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <input
        type="text"
        placeholder="技術で絞り込み..."
        value={filters.techStack}
        onChange={(e) => set({ techStack: e.target.value })}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-32"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">単価下限:</span>
        <span className="text-xs font-semibold text-blue-600 w-20">
          {filters.rateMin > 0 ? `${filters.rateMin}万円〜` : "指定なし"}
        </span>
        <input
          type="range" min={0} max={150} step={5}
          value={filters.rateMin}
          onChange={(e) => set({ rateMin: parseInt(e.target.value, 10) })}
          className="w-24"
        />
      </div>
      <select
        value={`${filters.sortBy}_${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split("_") as [FilterState["sortBy"], FilterState["sortOrder"]];
          set({ sortBy, sortOrder });
        }}
        className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
      >
        <option value="createdAt_desc">登録日: 新しい順</option>
        <option value="createdAt_asc">登録日: 古い順</option>
        <option value="rateMin_desc">単価: 高い順</option>
        <option value="rateMin_asc">単価: 低い順</option>
      </select>
      <span className="ml-auto text-xs text-gray-400">{shown} / {total} 件</span>
      <button onClick={() => window.open("/api/export?format=csv")} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">↓ CSV</button>
      <button onClick={() => window.open("/api/export?format=xlsx")} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-green-400 hover:text-green-600 transition">↓ Excel</button>
    </div>
  );
}
