/**
 * 東京都内 温泉・スーパー銭湯スクレイパー
 */
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const SOURCE = "onsen-official";

const KNOWN_ONSEN = [
  {
    name: "大江戸温泉物語 東京",
    address: "東京都江東区青海2-6-3",
    website: "https://ooedoonsen.jp/tokyo/",
    phone: "03-5500-1126",
    hours: "11:00〜翌9:00",
    parkingCategory: "C" as const,
    totalSpaces: 120,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "東京お台場 大江戸温泉物語",
    address: "東京都江東区青海2-6-3",
    website: "https://ooedoonsen.jp",
    phone: "03-5500-1126",
    hours: "11:00〜翌9:00",
    parkingCategory: "C" as const,
    totalSpaces: 200,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "SPA EAS（スパ・イアス）",
    address: "東京都八王子市みなみ野1-7-1",
    website: "https://www.ias-takao.jp/spa/",
    phone: "042-632-2641",
    hours: "10:00〜23:00",
    parkingCategory: "C" as const,
    totalSpaces: 2000,
    freeCondition: "館内2,000円以上利用で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
    notes: "イーアスTAKAO内",
  },
  {
    name: "東京染井温泉 SAKURA",
    address: "東京都豊島区駒込2-7-4",
    website: "https://www.sakura-2005.com",
    phone: "03-5907-5566",
    hours: "10:00〜23:00（月曜定休）",
    parkingCategory: "B" as const,
    totalSpaces: 30,
    freeCondition: "入浴利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分300円",
  },
  {
    name: "スパジアムジャポン",
    address: "東京都東久留米市東本町1-2",
    website: "https://spadium-japon.com",
    phone: "042-470-2614",
    hours: "10:00〜翌2:00",
    parkingCategory: "B" as const,
    totalSpaces: 500,
    freeCondition: "施設利用で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
  },
  {
    name: "おふろの王様 多摩センター店",
    address: "東京都多摩市落合2-32",
    website: "https://www.ousama2600.com/tama/",
    phone: "042-389-3726",
    hours: "9:00〜翌1:00",
    parkingCategory: "B" as const,
    totalSpaces: 200,
    freeCondition: "施設利用で3時間無料",
    freeMinutes: 180,
    paidRate: "以降30分100円",
  },
  {
    name: "おふろの王様 大井町店",
    address: "東京都品川区東大井5-8-20",
    website: "https://www.ousama2600.com/ooimachi/",
    phone: "03-6433-2611",
    hours: "9:00〜翌1:00",
    parkingCategory: "B" as const,
    totalSpaces: 80,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "おふろの王様 町田店",
    address: "東京都町田市中町2-9-1",
    website: "https://www.ousama2600.com/machida/",
    phone: "042-739-8726",
    hours: "9:00〜翌1:00",
    parkingCategory: "B" as const,
    totalSpaces: 150,
    freeCondition: "施設利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "東京天然温泉 古代の湯",
    address: "東京都板橋区舟渡4-15-2",
    website: "https://kodainoyu.com",
    phone: "03-5916-3826",
    hours: "10:00〜翌2:00",
    parkingCategory: "B" as const,
    totalSpaces: 120,
    freeCondition: "入浴利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分100円",
  },
  {
    name: "草加健康センター",
    address: "東京都足立区花畑7-11-3",
    website: "https://www.soka-kenko.com",
    phone: "03-5851-3726",
    hours: "24時間営業",
    parkingCategory: "B" as const,
    totalSpaces: 300,
    freeCondition: "施設利用で無料",
    notes: "24時間営業の大型施設",
  },
  {
    name: "越谷健康センター 湯乃市",
    address: "東京都葛飾区新宿1-3-12",
    website: "https://yunoichi.jp",
    phone: "03-3694-3126",
    hours: "10:00〜翌2:00",
    parkingCategory: "B" as const,
    totalSpaces: 80,
    freeCondition: "入浴利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分200円",
  },
  {
    name: "タイムズ スパ・レスタ",
    address: "東京都豊島区東池袋4-45-2",
    website: "https://times-spa.jp",
    phone: "03-5927-0095",
    hours: "11:00〜翌9:00",
    parkingCategory: "C" as const,
    totalSpaces: 200,
    freeCondition: "館内利用で2時間無料",
    freeMinutes: 120,
    paidRate: "以降30分400円",
    notes: "サンシャインシティ内",
  },
  {
    name: "東京浴場 久松湯",
    address: "東京都江戸川区南小岩7-15-8",
    website: "https://hisamatsuyu.jp",
    phone: "03-3659-1008",
    hours: "14:00〜23:00（水曜定休）",
    parkingCategory: "A" as const,
    totalSpaces: 20,
    notes: "無料駐車場あり",
  },
];

export async function scrapeOnsen(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[温泉・銭湯] 処理開始...");

  for (const onsen of KNOWN_ONSEN) {
    console.log(`  ジオコーディング: ${onsen.name}`);
    const coords = await geocode(onsen.address, `${onsen.name} 東京`);
    if (!coords) {
      errors.push(`geocode failed: ${onsen.name}`);
      continue;
    }

    const { parkingCategory, totalSpaces, freeCondition, freeMinutes, paidRate, notes, website, phone, hours } = onsen;

    facilities.push({
      name: onsen.name,
      category: "onsen",
      address: onsen.address,
      prefecture: "東京都",
      city: extractCity(onsen.address),
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

  console.log(`[温泉・銭湯] ${facilities.length} 件完了`);
  return { facilities, errors };
}
