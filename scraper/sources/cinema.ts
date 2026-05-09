/**
 * 東京都内 映画館・レジャー施設スクレイパー
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "cinema-official";

const KNOWN_CINEMAS = [
  // TOHOシネマズ
  {
    name: "TOHOシネマズ 府中",
    address: "東京都府中市宮西町2-1-2",
    website: "https://tohotheater.jp/theater/find/076_top.html",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 700,
    freeCondition: "映画1本鑑賞で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
  },
  {
    name: "TOHOシネマズ 日本橋",
    address: "東京都中央区日本橋室町2-1-1",
    website: "https://tohotheater.jp/theater/find/024_top.html",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    freeCondition: "映画1本鑑賞でサービス割引",
    paidRate: "30分300円",
    notes: "コレド室町2 駐車場（提携）",
  },
  {
    name: "TOHOシネマズ 立川立飛",
    address: "東京都立川市泉町935-1",
    website: "https://tohotheater.jp/theater/find/079_top.html",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 3200,
    freeCondition: "映画鑑賞で3時間無料（ららぽーと立川立飛駐車場）",
    freeMinutes: 180,
    paidRate: "以降30分200円",
  },
  {
    name: "TOHOシネマズ ららぽーと船橋（系）八王子",
    address: "東京都八王子市旭町9-1",
    website: "https://tohotheater.jp",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 1100,
    freeCondition: "映画鑑賞で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
    notes: "アリオ八王子内",
  },
  // イオンシネマ
  {
    name: "イオンシネマ 板橋",
    address: "東京都板橋区板橋2-68-1",
    website: "https://www.aeoncinema.com/cinema/itabashi/",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 600,
    freeCondition: "映画鑑賞＋2,000円以上購入で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
    notes: "イオン板橋駐車場",
  },
  {
    name: "イオンシネマ シアタス調布",
    address: "東京都調布市布田1-47-1",
    website: "https://ciemas.jp/chofu/",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 800,
    freeCondition: "映画鑑賞で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分200円",
  },
  // ユナイテッド・シネマ
  {
    name: "ユナイテッド・シネマ としまえん",
    address: "東京都練馬区向山3-25-1",
    website: "https://www.unitedcinemas.jp/toshimaen/",
    hours: "上映スケジュールによる",
    parkingCategory: "C" as const,
    totalSpaces: 2000,
    freeCondition: "映画鑑賞で3時間無料（ガレリア駐車場）",
    freeMinutes: 180,
    paidRate: "以降30分200円",
  },
  // ボウリング・レジャー施設
  {
    name: "ラウンドワン 立川店",
    address: "東京都立川市錦町2-1-2",
    website: "https://www.round1.co.jp/shop/tenpo/kanto-tachikawa.html",
    hours: "10:00〜翌5:00",
    parkingCategory: "C" as const,
    totalSpaces: 200,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "ラウンドワン 町田店",
    address: "東京都町田市原町田4-1-1",
    website: "https://www.round1.co.jp/shop/tenpo/kanto-machida.html",
    hours: "10:00〜翌5:00",
    parkingCategory: "C" as const,
    totalSpaces: 150,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "東京ドームシティ アトラクションズ",
    address: "東京都文京区後楽1-3-61",
    website: "https://www.tokyo-dome.co.jp/attractions/",
    phone: "03-3817-6001",
    hours: "10:00〜21:00（季節変動あり）",
    parkingCategory: "E" as const,
    totalSpaces: 1000,
    paidRate: "30分400円（最大2,400円）",
    notes: "東京ドーム隣接",
  },
  {
    name: "よみうりランド",
    address: "東京都稲城市矢野口4015-1",
    website: "https://www.yomiuriland.com",
    phone: "044-966-1111",
    hours: "10:00〜17:00（季節変動あり）",
    parkingCategory: "B" as const,
    totalSpaces: 2500,
    freeCondition: "入場者は駐車場無料",
    notes: "ただし繁忙期は混雑",
  },
  {
    name: "としまえん跡地（練馬城址公園）",
    address: "東京都練馬区向山3-25-1",
    website: "https://www.tokyo-park.or.jp/park/nerima-castle/",
    phone: "03-3990-8771",
    hours: "終日開放",
    parkingCategory: "D" as const,
    totalSpaces: 2000,
    paidRate: "1時間200円（最大600円）",
    notes: "ガレリア駐車場",
  },
];

export async function scrapeCinemas(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[映画館・レジャー] 処理開始...");

  for (const cinema of KNOWN_CINEMAS) {
    console.log(`  ジオコーディング: ${cinema.name}`);
    const coords = await geocode(cinema.address, `${cinema.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${cinema.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, freeCondition, freeMinutes, paidRate, notes, website, phone, hours } = cinema as typeof cinema & { freeCondition?: string; freeMinutes?: number; phone?: string };

    facilities.push({
      name: cinema.name,
      category: "cinema",
      address: cinema.address,
      prefecture: "東京都",
      city: extractCity(cinema.address),
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

  console.log(`[映画館・レジャー] ${facilities.length} 件完了`);
  return { facilities, errors };
}
