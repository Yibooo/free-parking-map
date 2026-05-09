/**
 * 東京都内 図書館・公共施設スクレイパー
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "library-official";

const KNOWN_LIBRARIES = [
  {
    name: "武蔵野市立武蔵野プレイス",
    address: "東京都武蔵野市境南町2-3-18",
    website: "https://www.musashino-place.jp",
    phone: "0422-30-1905",
    hours: "9:00〜22:00（月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 30,
    freeCondition: "図書館・施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "東京都立多摩図書館",
    address: "東京都国分寺市泉町2-2-26",
    website: "https://www.library.metro.tokyo.lg.jp/tama/",
    phone: "042-359-4011",
    hours: "9:30〜20:00（月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 80,
    freeCondition: "図書館利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "調布市文化会館たづくり",
    address: "東京都調布市小島町2-33-1",
    website: "https://www.chofu-culture-community.org/tazukuri/",
    phone: "042-441-6111",
    hours: "9:00〜22:00（第3月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 80,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "立川市市民会館（たましんRISURUホール）",
    address: "東京都立川市錦町3-3-20",
    website: "https://www.risuru-hall.jp",
    phone: "042-526-1311",
    hours: "9:00〜22:00（第1月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 100,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分100円",
  },
  {
    name: "八王子市学術・文化・スポーツ振興財団 いちょうホール",
    address: "東京都八王子市旭町9-1",
    website: "https://www.hachiojibunka.or.jp/ichouhal/",
    phone: "042-621-3001",
    hours: "9:00〜22:00（第3月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 1100,
    freeCondition: "ホール利用で2時間無料（アリオ八王子駐車場）",
    freeMinutes: 120,
    paidRate: "以降30分100円",
    notes: "アリオ八王子内",
  },
  {
    name: "府中市生涯学習センター（府中の森芸術劇場）",
    address: "東京都府中市浅間町1-2",
    website: "https://www.fuchu-theaterinfo.jp",
    phone: "042-335-6211",
    hours: "9:00〜22:00（第1月曜定休）",
    parkingCategory: "D" as const,
    totalSpaces: 200,
    paidRate: "1時間200円（最大600円）",
  },
  {
    name: "小金井市民交流センター（はけの森美術館）",
    address: "東京都小金井市中町1-9-5",
    phone: "042-387-9135",
    hours: "9:00〜22:00",
    parkingCategory: "B" as const,
    totalSpaces: 50,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "国立市公民館",
    address: "東京都国立市中1-15-1",
    phone: "042-574-1515",
    hours: "9:00〜22:00（第2月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 40,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "昭島市民会館（昭和の森会館）",
    address: "東京都昭島市田中町1-17-1",
    website: "https://www.showanomori.jp",
    phone: "042-543-3861",
    hours: "9:00〜22:00（第1月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 150,
    notes: "駐車場無料",
  },
  {
    name: "東大和市立図書館",
    address: "東京都東大和市中央3-930",
    phone: "042-563-2532",
    hours: "9:30〜20:00（月曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 50,
    notes: "図書館利用者は無料",
  },
];

export async function scrapeLibraries(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[図書館・公共施設] 処理開始...");

  for (const lib of KNOWN_LIBRARIES) {
    console.log(`  ジオコーディング: ${lib.name}`);
    const coords = await geocode(lib.address, `${lib.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${lib.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, freeCondition, freeMinutes, paidRate, notes, website, phone, hours } = lib as typeof lib & { freeCondition?: string; freeMinutes?: number; website?: string };

    facilities.push({
      name: lib.name,
      category: "library",
      address: lib.address,
      prefecture: "東京都",
      city: extractCity(lib.address),
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

  console.log(`[図書館・公共施設] ${facilities.length} 件完了`);
  return { facilities, errors };
}
