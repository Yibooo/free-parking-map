/**
 * 東京都内博物館・美術館スクレイパー
 * ソース: 各施設公式サイト / 東京都生活文化局
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "museum-official";

const KNOWN_MUSEUMS = [
  {
    name: "国立科学博物館",
    address: "東京都台東区上野公園7-20",
    website: "https://www.kahaku.go.jp",
    phone: "050-5541-8600",
    hours: "9:00〜17:00（土日祝〜18:00）月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 40,
    paidRate: "30分100円",
    notes: "上野公園内駐車場（パーク＆ライド推奨）",
  },
  {
    name: "江戸東京博物館",
    address: "東京都墨田区横網1-4-1",
    website: "https://www.edo-tokyo-museum.or.jp",
    phone: "03-3626-9974",
    hours: "9:30〜17:30（土曜〜19:30）月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 130,
    paidRate: "1時間200円、以降30分100円",
  },
  {
    name: "東京都現代美術館",
    address: "東京都江東区三好4-1-1",
    website: "https://www.mot-art-museum.jp",
    phone: "050-5541-8600",
    hours: "10:00〜18:00 月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 80,
    paidRate: "1時間200円（最大800円）",
  },
  {
    name: "東京国立博物館",
    address: "東京都台東区上野公園13-9",
    website: "https://www.tnm.jp",
    phone: "050-5541-8600",
    hours: "9:30〜17:00（金土〜21:00）月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 60,
    paidRate: "30分200円（最大1,200円）",
    notes: "普通車のみ。大型車不可",
  },
  {
    name: "国立西洋美術館",
    address: "東京都台東区上野公園7-7",
    website: "https://www.nmwa.go.jp",
    phone: "03-3828-5131",
    hours: "9:30〜17:30（金土〜20:00）月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 40,
    paidRate: "上野公園駐車場利用 30分100円",
  },
  {
    name: "東京都美術館",
    address: "東京都台東区上野公園8-36",
    website: "https://www.tobikan.jp",
    phone: "03-3823-6921",
    hours: "9:30〜17:30（金曜〜20:00）第1・3月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 40,
    paidRate: "30分100円",
    notes: "上野公園内共用駐車場",
  },
  {
    name: "東京都写真美術館",
    address: "東京都目黒区三田1-13-3",
    website: "https://topmuseum.jp",
    phone: "03-3280-0099",
    hours: "10:00〜18:00（木金〜20:00）月曜定休",
    parkingCategory: "D" as const,
    totalSpaces: 50,
    paidRate: "恵比寿ガーデンプレイス駐車場 30分150円（最大1,500円）",
  },
  {
    name: "江戸東京たてもの園",
    address: "東京都小金井市桜町3-7-1",
    website: "https://www.tatemonoen.jp",
    phone: "042-388-3300",
    hours: "9:30〜17:30（月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 900,
    paidRate: "小金井公園駐車場 1時間200円（最大600円）",
    notes: "小金井公園内。公園駐車場を共用",
  },
  {
    name: "多摩六都科学館",
    address: "東京都西東京市芝久保町5-10-64",
    website: "https://www.tamarokuto.or.jp",
    phone: "042-469-6100",
    hours: "9:30〜17:00（月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 100,
    freeCondition: "入館で1時間無料",
    freeMinutes: 60,
    paidRate: "以降30分100円",
    notes: "プラネタリウムで有名",
  },
  {
    name: "東京都葛西臨海公園展望広場レストハウス（葛西臨海水族園）",
    address: "東京都江戸川区臨海町6-2-3",
    website: "https://www.tokyo-zoo.net/zoo/kasai/",
    phone: "03-3869-5152",
    hours: "9:30〜17:00（水曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 502,
    paidRate: "1時間200円（最大600円）",
  },
];

export async function scrapeMuseums(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[博物館・美術館] 処理開始...");

  for (const museum of KNOWN_MUSEUMS) {
    console.log(`  ジオコーディング: ${museum.name}`);
    const coords = await geocode(museum.address, `${museum.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${museum.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, paidRate, notes, freeCondition, freeMinutes, website, phone, hours } = museum;

    facilities.push({
      name: museum.name,
      category: "museum",
      address: museum.address,
      prefecture: "東京都",
      city: extractCity(museum.address),
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
        freeCondition,
        freeMinutes,
      },
      source: SOURCE,
    });
  }

  console.log(`[博物館・美術館] ${facilities.length} 件完了`);
  return { facilities, errors };
}
