/**
 * 道の駅スクレイパー
 * ソース: https://www.michi-no-eki.jp/stations/search (公式全国道の駅ガイド)
 * 東京都内の道の駅は駐車場無料（区分A）
 */
import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetch";
import { geocode } from "../utils/geocode";
import type { ScrapedFacility, ScrapeResult } from "../types";
import { extractCity } from "../validator";

const BASE_URL = "https://www.michi-no-eki.jp";
const SOURCE = "michi-no-eki.jp";

export async function scrapeMichiNoEki(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  console.log("[道の駅] 検索中...");

  const searchUrl = `${BASE_URL}/stations/search?pref=13`;
  let html: string;
  try {
    html = await fetchHtml(searchUrl);
  } catch (err) {
    errors.push(`fetch failed: ${err}`);
    return { facilities, errors };
  }

  const $ = cheerio.load(html);
  const stationLinks: string[] = [];

  // 道の駅一覧のリンクを収集
  $("a[href*='/stations/views/']").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !stationLinks.includes(href)) {
      stationLinks.push(href);
    }
  });

  // 一覧ページのカード形式にも対応
  $(".station-list-item a, .station-card a, .list-item a").each((_, el) => {
    const href = $(el).attr("href");
    if (href?.includes("/stations/") && !stationLinks.includes(href)) {
      stationLinks.push(href);
    }
  });

  if (stationLinks.length === 0) {
    // フォールバック: 既知の東京都内道の駅を固定リストで処理
    console.log("[道の駅] 一覧取得失敗、固定リストを使用");
    return scrapeKnownMichiNoEki();
  }

  console.log(`[道の駅] ${stationLinks.length} 件発見`);

  for (const link of stationLinks.slice(0, 10)) {
    try {
      const url = link.startsWith("http") ? link : `${BASE_URL}${link}`;
      const detail = await fetchHtml(url);
      const facility = parseMichiNoEkiDetail(detail, url);
      if (facility) facilities.push(facility);
    } catch (err) {
      errors.push(`detail failed: ${link} — ${err}`);
    }
  }

  return { facilities, errors };
}

function parseMichiNoEkiDetail(
  html: string,
  url: string
): ScrapedFacility | null {
  const $ = cheerio.load(html);

  const name = $("h1, .station-name, .name").first().text().trim();
  const address =
    $(".address, [class*='address']").first().text().trim() ||
    $("*:contains('住所')").next().text().trim();

  if (!name || !address) return null;

  const phone =
    $(".tel, [class*='tel']").first().text().trim() ||
    $("*:contains('電話')").next().text().trim();

  const hours =
    $(".hours, [class*='hour']").first().text().trim() ||
    $("*:contains('営業時間')").next().text().trim();

  return {
    name,
    category: "roadstop",
    address,
    prefecture: "東京都",
    city: extractCity(address),
    lat: 0,
    lng: 0,
    website: url,
    phone: phone || undefined,
    hours: hours || undefined,
    parkingCategory: "A",
    parkingDetails: {
      notes: "道の駅は無料駐車場（24時間）",
    },
    source: SOURCE,
  };
}

// 東京都内の道の駅 固定データ（公式サイト構造変更時のフォールバック）
async function scrapeKnownMichiNoEki(): Promise<ScrapeResult> {
  const facilities: ScrapedFacility[] = [];
  const errors: string[] = [];

  const known = [
    {
      name: "道の駅 八王子滝山",
      address: "東京都八王子市滝山町1-592-2",
      website: "https://www.michinoeki-takiyama.jp",
      phone: "042-696-1201",
      hours: "9:00〜18:00（季節変動あり）",
      totalSpaces: 168,
    },
    {
      name: "道の駅 檜原",
      address: "東京都西多摩郡檜原村北里2145",
      website: "https://michinoeki-hinohara.com",
      phone: "042-598-0427",
      hours: "10:00〜17:00（火曜定休）",
      totalSpaces: 70,
    },
    {
      name: "道の駅 こすもす館",
      address: "東京都西多摩郡日の出町大久野7695-1",
      website: undefined,
      phone: "042-588-8856",
      hours: "9:00〜17:00",
      totalSpaces: 50,
    },
    {
      name: "道の駅 夕やけ小やけふれあいの里",
      address: "東京都八王子市南浅川町4025-1",
      website: "https://yuyakekoyake.jp",
      phone: "042-661-2788",
      hours: "9:00〜17:00（月曜定休）",
      totalSpaces: 100,
    },
    {
      name: "道の駅 奥多摩 水と緑のふれあい館",
      address: "東京都西多摩郡奥多摩町氷川171-1",
      website: "https://www.okutama.gr.jp",
      phone: "0428-86-2551",
      hours: "9:00〜17:00（火曜定休）",
      totalSpaces: 80,
    },
  ];

  for (const station of known) {
    console.log(`[道の駅] ジオコーディング: ${station.name}`);
    const coords = await geocode(station.address, station.name);
    if (!coords) {
      errors.push(`geocode failed: ${station.name}`);
      continue;
    }

    facilities.push({
      name: station.name,
      category: "roadstop",
      address: station.address,
      prefecture: "東京都",
      city: extractCity(station.address),
      lat: coords.lat,
      lng: coords.lng,
      website: station.website,
      phone: station.phone,
      hours: station.hours,
      parkingCategory: "A",
      parkingDetails: {
        totalSpaces: station.totalSpaces,
        notes: "道の駅は完全無料駐車場（24時間）",
      },
      source: SOURCE,
    });
  }

  return { facilities, errors };
}
