/**
 * 東京都立公園スクレイパー
 * ソース: https://www.tokyo-park.or.jp/park/park_top.html
 * (公益財団法人東京都公園協会)
 */
import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetch";
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "tokyo-park.or.jp";

// 駐車場のある主要都立公園（有料: 1時間200円前後が標準）
const KNOWN_PARKS = [
  {
    name: "昭和記念公園",
    address: "東京都立川市緑町3173",
    website: "https://www.showakinen-koen.jp",
    phone: "042-528-1751",
    hours: "9:30〜17:00（季節変動あり）",
    parkingCategory: "D" as const,
    totalSpaces: 1650,
    paidRate: "普通車 1時間310円（最大1,550円）",
    notes: "公園内5か所に駐車場あり。公園入園料別途。",
  },
  {
    name: "井の頭恩賜公園",
    address: "東京都武蔵野市御殿山1-18-31",
    website: "https://www.kensetsu.metro.tokyo.lg.jp/jimusho/seibuk/inokashira/",
    phone: "0422-47-6900",
    hours: "終日開放",
    parkingCategory: "D" as const,
    totalSpaces: 200,
    paidRate: "1時間200円（最大800円）",
  },
  {
    name: "小金井公園",
    address: "東京都小金井市関野町1-13-1",
    website: "https://www.tokyo-park.or.jp/park/koganei/",
    phone: "042-385-5611",
    hours: "終日開放（駐車場は8:00〜20:00）",
    parkingCategory: "D" as const,
    totalSpaces: 900,
    paidRate: "1時間200円（最大600円）",
    notes: "江戸東京たてもの園に隣接",
  },
  {
    name: "神代植物公園",
    address: "東京都調布市深大寺元町5-31-10",
    website: "https://www.tokyo-park.or.jp/park/jindai/",
    phone: "042-483-2300",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 300,
    paidRate: "1時間200円（最大600円）",
    notes: "バラやボタンの季節は大変混雑",
  },
  {
    name: "多摩川緑地公園",
    address: "東京都大田区多摩川2-13",
    website: "https://www.city.ota.tokyo.jp/",
    phone: "03-3733-4975",
    hours: "終日開放",
    parkingCategory: "D" as const,
    totalSpaces: 150,
    paidRate: "1時間200円",
  },
  {
    name: "砧公園",
    address: "東京都世田谷区砧公園1-1",
    website: "https://www.tokyo-park.or.jp/park/kinuta/",
    phone: "03-3700-0414",
    hours: "終日開放",
    parkingCategory: "D" as const,
    totalSpaces: 250,
    paidRate: "1時間200円（最大800円）",
  },
  {
    name: "水元公園",
    address: "東京都葛飾区水元公園3-2",
    website: "https://www.tokyo-park.or.jp/park/mizumoto/",
    phone: "03-3607-8321",
    hours: "終日開放",
    parkingCategory: "D" as const,
    totalSpaces: 410,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "夢の島公園",
    address: "東京都江東区夢の島2-1-2",
    website: "https://www.tokyo-park.or.jp/park/yumenoshima/",
    phone: "03-3522-0281",
    hours: "終日開放（駐車場は8:00〜22:00）",
    parkingCategory: "D" as const,
    totalSpaces: 300,
    paidRate: "1時間200円（最大600円）",
  },
];

export async function scrapeParks(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[都立公園] 処理開始...");

  for (const park of KNOWN_PARKS) {
    console.log(`  ジオコーディング: ${park.name}`);
    const coords = await geocode(park.address, `${park.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${park.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, paidRate, notes, website, phone, hours, ...rest } = park;

    facilities.push({
      name: park.name,
      category: "park",
      address: park.address,
      prefecture: "東京都",
      city: extractCity(park.address),
      lat: coords.lat,
      lng: coords.lng,
      website,
      phone,
      hours,
      parkingCategory,
      parkingDetails: {
        totalSpaces,
        paidRate,
        notes,
      },
      source: SOURCE,
    });
  }

  console.log(`[都立公園] ${facilities.length} 件完了`);
  return { facilities, errors };
}
