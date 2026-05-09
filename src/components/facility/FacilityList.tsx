"use client";

import type { Doc } from "../../../convex/_generated/dataModel";
import { FacilityCard } from "./FacilityCard";

type Props = {
  facilities: Doc<"facilities">[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function FacilityList({ facilities, selectedId, onSelect }: Props) {
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
      <p className="text-xs text-muted-foreground px-1">
        {facilities.length} 件の施設
      </p>
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
