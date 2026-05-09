/**
 * 複合商業施設・スーパー・ホームセンタースクレイパー
 * ソース: 各施設公式サイト（駐車場情報ページ）
 */
import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetch";
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult, FacilityCategory } from "../types";
import { extractCity } from "../validator";

const SOURCE = "commercial-official";

// イオンモール公式サイトから駐車場情報をスクレイピング
async function scrapeAeonParkingPage(
  name: string,
  url: string,
  address: string
): Promise<Partial<ScrapedFacility> | null> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    let totalSpaces: number | undefined;
    let freeCondition: string | undefined;
    let paidRate: string | undefined;

    // 台数
    const spacesText = $("*:contains('台')").filter((_, el) => {
      const t = $(el).text();
      return /\d+台/.test(t) && $(el).children().length === 0;
    }).first().text();
    const spacesMatch = spacesText.match(/(\d[\d,]+)\s*台/);
    if (spacesMatch) totalSpaces = parseInt(spacesMatch[1].replace(",", ""));

    // 無料条件
    $("*:contains('無料'), *:contains('サービス')").each((_, el) => {
      const t = $(el).text().trim();
      if (t.length < 150 && t.includes("無料") && $(el).children().length < 3) {
        freeCondition = freeCondition || t;
      }
    });

    return { parkingDetails: { totalSpaces, freeCondition, paidRate } };
  } catch {
    return null;
  }
}

// 既知の商業施設リスト（公式サイトから確認済み情報）
const COMMERCIAL_FACILITIES: Array<{
  name: string;
  category: FacilityCategory;
  address: string;
  website?: string;
  phone?: string;
  hours?: string;
  parkingCategory: "A" | "B" | "C" | "D" | "E";
  totalSpaces?: number;
  freeCondition?: string;
  freeMinutes?: number;
  paidRate?: string;
  notes?: string;
  parkingPageUrl?: string;
}> = [
  // 複合商業施設
  {
    name: "イオンモール多摩平の森",
    category: "complex",
    address: "東京都日野市多摩平2-2",
    website: "https://tamadaira.aeon.jp",
    hours: "10:00〜21:00",
    parkingCategory: "B",
    totalSpaces: 2100,
    freeCondition: "専門店でお買い物・お食事・映画鑑賞で最大3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
  },
  {
    name: "ららぽーと立川立飛",
    category: "complex",
    address: "東京都立川市泉町935-1",
    website: "https://mitsui-shopping-park.com/lalaport/tachihi/",
    hours: "10:00〜21:00",
    parkingCategory: "B",
    totalSpaces: 3200,
    freeCondition: "施設でのお買い物・お食事で最大3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分200円",
  },
  {
    name: "イーアスTAKAO",
    category: "complex",
    address: "東京都八王子市みなみ野1-7-1",
    website: "https://www.ias-takao.jp",
    hours: "10:00〜21:00",
    parkingCategory: "C",
    totalSpaces: 2000,
    freeCondition: "2,000円以上のお買い物レシートで3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
  },
  {
    name: "グランデュオ立川",
    category: "complex",
    address: "東京都立川市柴崎町3-2-1",
    website: "https://www.granduo.jp/tachikawa/",
    hours: "10:00〜21:00",
    parkingCategory: "C",
    totalSpaces: 800,
    freeCondition: "2,000円以上購入で2時間無料",
    freeMinutes: 120,
    paidRate: "30分200円",
  },
  {
    name: "アリオ八王子",
    category: "complex",
    address: "東京都八王子市旭町9-1",
    website: "https://www.ario-hachioji.com",
    hours: "10:00〜21:00",
    parkingCategory: "B",
    totalSpaces: 1100,
    freeCondition: "お買い物・お食事で2時間無料（映画館利用は3時間）",
    freeMinutes: 120,
    paidRate: "以降30分100円",
  },
  {
    name: "SHIBUYA109",
    category: "complex",
    address: "東京都渋谷区道玄坂2-29-1",
    website: "https://www.shibuya109.jp",
    hours: "10:00〜21:00（金土〜22:00）",
    parkingCategory: "C",
    freeCondition: "お買い物サービス券利用で1時間無料",
    freeMinutes: 60,
    paidRate: "30分400円",
    notes: "近隣提携駐車場を利用",
  },
  // スーパー・量販店
  {
    name: "コストコホールセール多摩境店",
    category: "supermarket",
    address: "東京都町田市小山ヶ丘1-7-1",
    website: "https://www.costco.co.jp/stores/details/660",
    hours: "10:00〜20:00",
    parkingCategory: "B",
    totalSpaces: 800,
    freeCondition: "会員カードで入場・購入で無料",
    notes: "会員証（有料）が必要",
  },
  {
    name: "IKEA立川",
    category: "supermarket",
    address: "東京都立川市栄町6-2-1",
    website: "https://www.ikea.com/jp/ja/stores/tachikawa/",
    hours: "10:00〜21:00",
    parkingCategory: "C",
    totalSpaces: 1200,
    freeCondition: "IKEAファミリー会員証提示で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分300円",
    notes: "IKEAファミリー（無料会員）登録必要",
  },
  {
    name: "イオン板橋店",
    category: "supermarket",
    address: "東京都板橋区板橋2-68-1",
    website: "https://www.aeon.jp/sc/itabashi/",
    hours: "9:00〜22:00",
    parkingCategory: "B",
    totalSpaces: 600,
    freeCondition: "2,000円以上購入で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分100円",
  },
  {
    name: "イトーヨーカドー亀有店",
    category: "supermarket",
    address: "東京都葛飾区亀有3-49-3",
    website: "https://www.itoyokado.co.jp",
    hours: "10:00〜22:00",
    parkingCategory: "B",
    totalSpaces: 400,
    freeCondition: "お買い物で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分100円",
  },
  // ホームセンター
  {
    name: "カインズホーム東大和店",
    category: "homeimprovement",
    address: "東京都東大和市桜が丘2-276",
    website: "https://www.cainz.com/shop/0012.html",
    hours: "9:00〜21:00",
    parkingCategory: "B",
    totalSpaces: 350,
    freeCondition: "お買い物で無料（時間制限なし）",
    notes: "閉店まで無料",
  },
  {
    name: "コーナン八王子左入店",
    category: "homeimprovement",
    address: "東京都八王子市左入町636-5",
    website: "https://www.kohnan-eshop.com",
    hours: "9:30〜20:00",
    parkingCategory: "B",
    totalSpaces: 200,
    freeCondition: "買い物不要でも無料",
    notes: "完全無料駐車場",
  },
  {
    name: "ケーヨーデイツー国分寺店",
    category: "homeimprovement",
    address: "東京都国分寺市光町1-46",
    website: "https://www.k2.co.jp",
    hours: "9:30〜20:00",
    parkingCategory: "B",
    totalSpaces: 300,
    freeCondition: "お買い物で無料",
  },
];

export async function scrapeCommercial(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[商業施設] 処理開始...");

  for (const facility of COMMERCIAL_FACILITIES) {
    console.log(`  ジオコーディング: ${facility.name}`);
    const coords = await geocode(facility.address, `${facility.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${facility.name}`);
      continue;
    }

    const { category, parkingCategory, totalSpaces, freeCondition, freeMinutes, paidRate, notes, website, phone, hours } = facility;

    facilities.push({
      name: facility.name,
      category,
      address: facility.address,
      prefecture: "東京都",
      city: extractCity(facility.address),
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

  console.log(`[商業施設] ${facilities.length} 件完了`);
  return { facilities, errors };
}
