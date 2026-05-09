"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FilterPanel } from "@/components/filter/FilterPanel";
import { FacilityList } from "@/components/facility/FacilityList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PARKING_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

const LeafletMap = dynamic(
  () => import("./LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" /> }
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
  const [locateTrigger, setLocateTrigger] = useState(0);

  const facilities = useQuery(api.facilities.list, {
    categories: filters.facilityCategories.length > 0 ? filters.facilityCategories : undefined,
    parkingCategories: filters.parkingCategories.length > 0 ? filters.parkingCategories : undefined,
    search: search || undefined,
  });

  const isLoading = facilities === undefined;
  const facilityList = facilities ?? [];

  const handleLocate = useCallback(() => {
    setLocateTrigger((n) => n + 1);
  }, []);

  const activeFilterCount =
    filters.parkingCategories.length + filters.facilityCategories.length;

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="flex items-center gap-2 px-3 py-2 border-b bg-white z-10 shrink-0 shadow-sm">
        <h1 className="font-bold text-sm text-green-700 whitespace-nowrap flex items-center gap-1">
          <span className="text-base">🅿️</span>
          <span className="hidden sm:inline">無料駐車場マップ</span>
        </h1>
        <div className="flex-1 relative">
          <input
            type="search"
            placeholder="施設名・住所で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border rounded-lg px-3 py-1.5 pl-8 outline-none focus:ring-2 focus:ring-green-500 bg-slate-50"
          />
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={handleLocate}
          title="現在地に移動"
          className="p-1.5 rounded-lg border bg-white hover:bg-slate-50 shrink-0 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        <Link href="/admin" className="shrink-0 text-slate-400 hover:text-slate-600 p-1" title="管理">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
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
            facilities={facilityList}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isLoading={isLoading}
          />
        </aside>

        {/* 地図 */}
        <div className="flex-1 relative">
          <LeafletMap
            facilities={facilityList}
            selectedId={selectedId}
            onSelect={setSelectedId}
            locateTrigger={locateTrigger}
          />

          {/* 凡例（デスクトップ） */}
          <div className="hidden md:flex absolute top-3 right-3 z-[1000] flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-lg border text-xs">
            {Object.entries(PARKING_CATEGORIES).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: val.color }}
                >
                  {key}
                </span>
                <span className="text-slate-600">{val.label}</span>
              </div>
            ))}
          </div>

          {/* モバイル：フィルタ & リストボタン */}
          <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-[1000]">
            <Sheet>
              <SheetTrigger className="inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                フィルタ
                {activeFilterCount > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
                <FilterPanel filters={filters} onChange={setFilters} />
              </SheetContent>
            </Sheet>

            <Sheet open={listOpen} onOpenChange={setListOpen}>
              <SheetTrigger className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                施設一覧
                {!isLoading && (
                  <span className="bg-white/20 rounded-full px-1.5">{facilityList.length}</span>
                )}
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
                <FacilityList
                  facilities={facilityList}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setListOpen(false);
                  }}
                  isLoading={isLoading}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
