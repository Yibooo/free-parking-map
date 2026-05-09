"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { FacilityList } from "@/components/facility/FacilityList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const LeafletMap = dynamic(
  () => import("./LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse" /> }
);

type FilterState = {
  parkingCategories: string[];
  facilityCategories: string[];
};

export function MapPage() {
  const [filters, setFilters] = useState<FilterState>({
    parkingCategories: [],
    facilityCategories: [],
  });
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [listOpen, setListOpen] = useState(false);

  const facilities = useQuery(api.facilities.list, {
    categories: filters.facilityCategories.length > 0 ? filters.facilityCategories : undefined,
    parkingCategories: filters.parkingCategories.length > 0 ? filters.parkingCategories : undefined,
    search: search || undefined,
  }) ?? [];

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 px-4 py-2 border-b bg-white z-10 shrink-0">
        <h1 className="font-bold text-base text-green-700 whitespace-nowrap">🅿️ 無料駐車場マップ</h1>
        <input
          type="search"
          placeholder="施設名・住所で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-500"
        />
      </header>

      {/* フィルタバー（デスクトップ） */}
      <div className="hidden md:block border-b bg-white shrink-0">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドリスト（デスクトップ） */}
        <aside className="hidden md:flex w-80 flex-col border-r bg-white overflow-y-auto shrink-0">
          <FacilityList
            facilities={facilities}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        {/* 地図 */}
        <div className="flex-1 relative">
          <LeafletMap
            facilities={facilities}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* モバイル：フィルタ & リストボタン */}
          <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-[1000]">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center gap-2 rounded-md border bg-white px-3 py-1.5 text-sm font-medium shadow-lg">
                🔧 フィルタ
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
                <FilterPanel filters={filters} onChange={setFilters} />
              </SheetContent>
            </Sheet>

            <Sheet open={listOpen} onOpenChange={setListOpen}>
              <SheetTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-green-700">
                📋 施設一覧 ({facilities.length})
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
                <FacilityList
                  facilities={facilities}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setListOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
