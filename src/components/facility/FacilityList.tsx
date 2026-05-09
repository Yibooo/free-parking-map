"use client";

import type { Doc } from "../../../convex/_generated/dataModel";
import { FacilityCard } from "./FacilityCard";

type Props = {
  facilities: Doc<"facilities">[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
};

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg border bg-background animate-pulse">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="h-5 w-8 bg-slate-200 rounded" />
          </div>
          <div className="mt-2 h-3 bg-slate-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function FacilityList({ facilities, selectedId, onSelect, isLoading }: Props) {
  if (isLoading) return <Skeleton />;

  if (facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
        <span className="text-3xl">🔍</span>
        <p>条件に一致する施設が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs text-muted-foreground px-1">{facilities.length} 件の施設</p>
      {facilities.map((f) => (
        <FacilityCard
          key={f._id}
          facility={f}
          isSelected={selectedId === f._id}
          onClick={() => onSelect?.(f._id)}
        />
      ))}
    </div>
  );
}
