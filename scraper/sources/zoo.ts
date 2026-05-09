/**
 * 東京都内 動物園・水族館スクレイパー
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "zoo-official";

const KNOWN_ZOOS = [
  {
    name: "葛西臨海水族園",
    address: "東京都江戸川区臨海町6-2-3",
    website: "https://www.tokyo-zoo.net/zoo/kasai/",
    phone: "03-3869-5152",
    hours: "9:30〜17:00（水曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 502,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "多摩動物公園",
    address: "東京都日野市程久保7-1-1",
    website: "https://www.tokyo-zoo.net/zoo/tama/",
    phone: "042-591-1611",
    hours: "9:30〜17:00（水曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 850,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "上野動物園",
    address: "東京都台東区上野公園9-83",
    website: "https://www.tokyo-zoo.net/zoo/ueno/",
    phone: "03-3828-5171",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 40,
    paidRate: "上野公園駐車場 30分100円",
    notes: "上野公園内共用駐車場",
  },
  {
    name: "井の頭自然文化園",
    address: "東京都武蔵野市御殿山1-17-6",
    website: "https://www.tokyo-zoo.net/zoo/ino/",
    phone: "0422-46-1100",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 200,
    paidRate: "1時間200円（最大800円）",
    notes: "井の頭恩賜公園駐車場を共用",
  },
  {
    name: "サンシャイン水族館",
    address: "東京都豊島区東池袋3-1",
    website: "https://sunshinecity.jp/aquarium/",
    phone: "03-3989-3466",
    hours: "10:00〜20:00（季節変動あり）",
    parkingCategory: "C" as const,
    totalSpaces: 800,
    freeCondition: "施設利用で2時間無料（サンシャインシティ駐車場）",
    freeMinutes: 120,
    paidRate: "以降30分300円",
  },
  {
    name: "東京タワー水族館（マリンパーク）",
    address: "東京都港区芝公園4-2-8",
    website: "https://www.tokyotower.co.jp",
    phone: "03-3433-5111",
    hours: "9:00〜22:00",
    parkingCategory: "E" as const,
    totalSpaces: 100,
    paidRate: "30分300円（最大2,400円）",
  },
  {
    name: "しながわ水族館",
    address: "東京都品川区勝島3-2-1",
    website: "https://www.aquarium.gr.jp",
    phone: "03-3762-3433",
    hours: "10:00〜17:00（火曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 150,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "東京都葛西臨海公園（Bird Watching & Nature Center）",
    address: "東京都江戸川区臨海町6-2",
    website: "https://www.tokyo-park.or.jp/park/kasai/",
    phone: "03-5696-1331",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 502,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "多摩川ふれあい水族館",
    address: "東京都調布市多摩川4-491",
    website: "https://www.tama-aquarium.jp",
    phone: "042-488-2561",
    hours: "9:30〜16:30（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 50,
    notes: "無料駐車場あり",
  },
  {
    name: "夢の島熱帯植物館",
    address: "東京都江東区夢の島2-1-2",
    website: "https://www.yumenoshima.jp",
    phone: "03-3522-0281",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 300,
    paidRate: "1時間200円（最大600円）",
    notes: "夢の島公園駐車場を共用",
  },
];

export async function scrapeZoos(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[動物園・水族館] 処理開始...");

  for (const zoo of KNOWN_ZOOS) {
    console.log(`  ジオコーディング: ${zoo.name}`);
    const coords = await geocode(zoo.address, `${zoo.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${zoo.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, freeCondition, freeMinutes, paidRate, notes, website, phone, hours } = zoo as typeof zoo & { freeCondition?: string; freeMinutes?: number };

    facilities.push({
      name: zoo.name,
      category: "zoo",
      address: zoo.address,
      prefecture: "東京都",
      city: extractCity(zoo.address),
      lat: coords.lat,
      lng: coords.lng,
      website,
      phone,
      hours,
      parkingCategory,
      parkingDetails: { totalSpaces, freeCondition, freeMinutes, paidRate, notes },
      source: SOURCE,
    });
  }

  console.log(`[動物園・水族館] ${facilities.length} 件完了`);
  return { facilities, errors };
}
