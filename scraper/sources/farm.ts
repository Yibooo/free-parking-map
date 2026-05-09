/**
 * 東京都内 農産物直売所スクレイパー
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "farm-official";

const KNOWN_FARMS = [
  {
    name: "JAファーマーズマーケット ファームサイドみのり（日野）",
    address: "東京都日野市程久保2-26-1",
    phone: "042-586-6080",
    hours: "9:00〜17:00（火曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 60,
    notes: "買い物不要でも無料",
  },
  {
    name: "JAとうきょう農産物直売所 あさかわ市場",
    address: "東京都八王子市元本郷町3-7-2",
    phone: "042-628-2031",
    hours: "9:00〜17:00（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 40,
    notes: "完全無料駐車場",
  },
  {
    name: "多摩農協 農産物直売所 ベジフルセンター",
    address: "東京都立川市西砂町1-40-1",
    phone: "042-536-9200",
    hours: "9:00〜17:00",
    parkingCategory: "A" as const,
    totalSpaces: 50,
    notes: "無料駐車場あり",
  },
  {
    name: "JA東京みどり 農産物直売所",
    address: "東京都青梅市河辺町8-14-7",
    phone: "0428-24-5111",
    hours: "9:00〜18:00",
    parkingCategory: "A" as const,
    totalSpaces: 80,
    notes: "無料駐車場あり",
  },
  {
    name: "道の駅 八王子滝山 農産物直売所",
    address: "東京都八王子市滝山町1-592-2",
    website: "https://www.michinoeki-takiyama.jp",
    phone: "042-696-1201",
    hours: "9:00〜18:00",
    parkingCategory: "A" as const,
    totalSpaces: 168,
    notes: "道の駅内直売所・完全無料",
  },
  {
    name: "JA東京あおば 農産物直売所 いのかしら",
    address: "東京都三鷹市井の頭5-7-1",
    phone: "0422-43-9721",
    hours: "10:00〜17:00（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 30,
    notes: "無料駐車場あり",
  },
  {
    name: "JAマインズ 農産物直売所 はなっこり〜",
    address: "東京都府中市住吉町3-1",
    phone: "042-333-5700",
    hours: "9:30〜17:30（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 50,
    notes: "完全無料駐車場",
  },
  {
    name: "JAにしたま 農産物直売所 あきる野店",
    address: "東京都あきる野市小川1081",
    phone: "042-558-7071",
    hours: "9:00〜17:00",
    parkingCategory: "A" as const,
    totalSpaces: 70,
    notes: "無料駐車場あり",
  },
  {
    name: "町田市 農業体験農園・直売所",
    address: "東京都町田市相原町4004",
    hours: "9:00〜17:00（日曜・祝日のみ）",
    parkingCategory: "A" as const,
    totalSpaces: 30,
    notes: "無料駐車場あり",
  },
  {
    name: "東京都農業振興事務所 農産物直売 小平ふるさと村",
    address: "東京都小平市天神町4-4",
    phone: "042-321-1010",
    hours: "9:30〜16:30（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 40,
    notes: "無料駐車場あり",
  },
];

export async function scrapeFarms(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[農産物直売所] 処理開始...");

  for (const farm of KNOWN_FARMS) {
    console.log(`  ジオコーディング: ${farm.name}`);
    const coords = await geocode(farm.address, `${farm.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${farm.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, notes, website, phone, hours } = farm as typeof farm & { website?: string };

    facilities.push({
      name: farm.name,
      category: "farm",
      address: farm.address,
      prefecture: "東京都",
      city: extractCity(farm.address),
      lat: coords.lat,
      lng: coords.lng,
      website,
      phone,
      hours,
      parkingCategory,
      parkingDetails: { totalSpaces, notes },
      source: SOURCE,
    });
  }

  console.log(`[農産物直売所] ${facilities.length} 件完了`);
  return { facilities, errors };
}
