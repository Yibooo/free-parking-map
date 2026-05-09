import type { ScrapedFacility } from "./types";

const TOKYO_BOUNDS = {
  latMin: 35.4,
  latMax: 35.9,
  lngMin: 138.9,
  lngMax: 139.95,
};

export function validate(f: ScrapedFacility): string[] {
  const errors: string[] = [];

  if (!f.name?.trim()) errors.push("name is empty");
  if (!f.address?.trim()) errors.push("address is empty");
  if (!f.prefecture?.trim()) errors.push("prefecture is empty");
  if (!f.city?.trim()) errors.push("city is empty");

  if (!isFinite(f.lat) || !isFinite(f.lng)) {
    errors.push(`invalid coordinates: lat=${f.lat} lng=${f.lng}`);
  } else if (
    f.lat < TOKYO_BOUNDS.latMin ||
    f.lat > TOKYO_BOUNDS.latMax ||
    f.lng < TOKYO_BOUNDS.lngMin ||
    f.lng > TOKYO_BOUNDS.lngMax
  ) {
    errors.push(`coordinates out of Tokyo bounds: ${f.lat},${f.lng}`);
  }

  const validParkingCategories = ["A", "B", "C", "D", "E"];
  if (!validParkingCategories.includes(f.parkingCategory)) {
    errors.push(`invalid parkingCategory: ${f.parkingCategory}`);
  }

  const validCategories = [
    "complex", "supermarket", "museum", "onsen", "park",
    "zoo", "homeimprovement", "cinema", "farm", "library", "roadstop",
  ];
  if (!validCategories.includes(f.category)) {
    errors.push(`invalid category: ${f.category}`);
  }

  return errors;
}

export function normalize(f: ScrapedFacility): ScrapedFacility {
  return {
    ...f,
    name: f.name.trim(),
    address: f.address.trim(),
    prefecture: f.prefecture.trim(),
    city: f.city.trim(),
    phone: f.phone?.replace(/[（）\s]/g, "").replace(/ー/g, "-").trim(),
    hours: f.hours?.trim(),
    website: f.website?.trim(),
  };
}

export function extractCity(address: string): string {
  // 「東京都○○市」「東京都○○区」を抽出
  const m = address.match(/東京都([^\s]+?[市区町村])/);
  return m ? m[1] : "";
}

export function extractPrefecture(address: string): string {
  const m = address.match(/^(.+?[都道府県])/);
  return m ? m[1] : "東京都";
}
