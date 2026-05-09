export const PARKING_CATEGORIES = {
  A: {
    label: "完全無料",
    description: "施設利用条件なし・完全無料",
    color: "#16a34a",
    bgColor: "bg-green-600",
    textColor: "text-green-600",
    borderColor: "border-green-600",
  },
  B: {
    label: "利用で無料",
    description: "施設利用（入場・購入）で完全無料",
    color: "#2563eb",
    bgColor: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-600",
  },
  C: {
    label: "条件付き無料",
    description: "施設利用で一定時間まで無料、以降有料",
    color: "#d97706",
    bgColor: "bg-amber-600",
    textColor: "text-amber-600",
    borderColor: "border-amber-600",
  },
  D: {
    label: "低額有料",
    description: "有料・1時間200円以下",
    color: "#9333ea",
    bgColor: "bg-purple-600",
    textColor: "text-purple-600",
    borderColor: "border-purple-600",
  },
  E: {
    label: "安価有料",
    description: "有料・1時間201〜500円",
    color: "#64748b",
    bgColor: "bg-slate-500",
    textColor: "text-slate-500",
    borderColor: "border-slate-500",
  },
} as const;

export type ParkingCategoryKey = keyof typeof PARKING_CATEGORIES;

export const FACILITY_CATEGORIES = {
  complex: { label: "複合商業施設", icon: "🏬" },
  supermarket: { label: "スーパー・量販店", icon: "🛒" },
  museum: { label: "博物館・美術館", icon: "🏛️" },
  onsen: { label: "温泉・銭湯", icon: "♨️" },
  park: { label: "公園・アウトドア", icon: "🌳" },
  zoo: { label: "動物園・水族館", icon: "🐘" },
  homeimprovement: { label: "ホームセンター", icon: "🔨" },
  cinema: { label: "映画館・レジャー", icon: "🎬" },
  farm: { label: "農産物直売所", icon: "🥬" },
  library: { label: "図書館・公共施設", icon: "📚" },
  roadstop: { label: "道の駅・物産館", icon: "🛣️" },
} as const;

export type FacilityCategoryKey = keyof typeof FACILITY_CATEGORIES;

export const TOKYO_CENTER = { lat: 35.6762, lng: 139.6503 };
export const DEFAULT_ZOOM = 11;
