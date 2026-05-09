"use client";

import { PARKING_CATEGORIES, FACILITY_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type FilterState = {
  parkingCategories: string[];
  facilityCategories: string[];
};

type Props = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

export function FilterPanel({ filters, onChange }: Props) {
  function toggleParking(key: string) {
    const next = filters.parkingCategories.includes(key)
      ? filters.parkingCategories.filter((k) => k !== key)
      : [...filters.parkingCategories, key];
    onChange({ ...filters, parkingCategories: next });
  }

  function toggleCategory(key: string) {
    const next = filters.facilityCategories.includes(key)
      ? filters.facilityCategories.filter((k) => k !== key)
      : [...filters.facilityCategories, key];
    onChange({ ...filters, facilityCategories: next });
  }

  const allParkingSelected = filters.parkingCategories.length === 0;
  const allCategorySelected = filters.facilityCategories.length === 0;

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          駐車場区分
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={allParkingSelected ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onChange({ ...filters, parkingCategories: [] })}
          >
            すべて
          </Badge>
          {Object.entries(PARKING_CATEGORIES).map(([key, val]) => {
            const active = filters.parkingCategories.includes(key);
            return (
              <Badge
                key={key}
                variant={active ? "default" : "outline"}
                className="cursor-pointer gap-1"
                style={
                  active
                    ? { backgroundColor: val.color, borderColor: val.color }
                    : { borderColor: val.color, color: val.color }
                }
                onClick={() => toggleParking(key)}
              >
                {key}：{val.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          施設カテゴリ
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={allCategorySelected ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onChange({ ...filters, facilityCategories: [] })}
          >
            すべて
          </Badge>
          {Object.entries(FACILITY_CATEGORIES).map(([key, val]) => {
            const active = filters.facilityCategories.includes(key);
            return (
              <Badge
                key={key}
                variant={active ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(key)}
              >
                {val.icon} {val.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
