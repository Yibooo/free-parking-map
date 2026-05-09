"use client";

import type { Doc } from "../../../convex/_generated/dataModel";
import { PARKING_CATEGORIES, FACILITY_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Props = {
  facility: Doc<"facilities">;
  onClick?: () => void;
  isSelected?: boolean;
};

export function FacilityCard({ facility, onClick, isSelected }: Props) {
  const parking = PARKING_CATEGORIES[facility.parkingCategory];
  const category = FACILITY_CATEGORIES[facility.category];

  return (
    <Link href={`/facilities/${facility._id}`}>
      <div
        onClick={onClick}
        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
          isSelected ? "bg-accent border-primary" : "bg-background"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{facility.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {facility.city} · {facility.hours ?? "営業時間未確認"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge
              className="text-xs px-1.5 py-0 text-white"
              style={{ backgroundColor: parking.color }}
            >
              {facility.parkingCategory}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-xs">{category.icon}</span>
          <span className="text-xs text-muted-foreground">{category.label}</span>
          {facility.parkingDetails.freeCondition && (
            <span className="text-xs text-muted-foreground ml-1 truncate">
              · {facility.parkingDetails.freeCondition}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
