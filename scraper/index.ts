#!/usr/bin/env node
/**
 * 無料駐車場マップ スクレイパー CLI
 *
 * 使い方:
 *   npx tsx scraper/index.ts [--source <source>] [--dry-run] [--prod]
 *
 * オプション:
 *   --source michinoeki|parks|museums|commercial|all  (デフォルト: all)
 *   --dry-run   Convex には保存せず結果を標準出力のみ
 *   --prod      本番 Convex に保存（デフォルトは dev）
 */
import { config } from "dotenv";
import { resolve } from "path";

// .env.local を読み込む
config({ path: resolve(process.cwd(), ".env.local") });

import { scrapeMichiNoEki } from "./sources/michinoeki";
import { scrapeParks } from "./sources/parks";
import { scrapeMuseums } from "./sources/museums";
import { scrapeCommercial } from "./sources/complexes";
import { validate, normalize } from "./validator";
import { insertFacility, checkDuplicate } from "./client";
import type { ScrapeResult } from "./types";

const args = process.argv.slice(2);
const sourceArg = args.find((a) => a.startsWith("--source="))?.split("=")[1]
  ?? (args[args.indexOf("--source") + 1] ?? "all");
const isDryRun = args.includes("--dry-run");
const isProd = args.includes("--prod");

if (isProd) {
  const prodUrl = process.env.CONVEX_PROD_URL;
  if (prodUrl) process.env.NEXT_PUBLIC_CONVEX_URL = prodUrl;
}

async function main() {
  console.log("=".repeat(60));
  console.log("無料駐車場マップ スクレイパー起動");
  console.log(`  ソース  : ${sourceArg}`);
  console.log(`  dry-run : ${isDryRun}`);
  console.log(`  Convex  : ${process.env.NEXT_PUBLIC_CONVEX_URL}`);
  console.log("=".repeat(60));

  const results: ScrapeResult[] = [];

  if (sourceArg === "all" || sourceArg === "michinoeki") {
    results.push(await scrapeMichiNoEki());
  }
  if (sourceArg === "all" || sourceArg === "parks") {
    results.push(await scrapeParks());
  }
  if (sourceArg === "all" || sourceArg === "museums") {
    results.push(await scrapeMuseums());
  }
  if (sourceArg === "all" || sourceArg === "commercial") {
    results.push(await scrapeCommercial());
  }

  // 集計
  const allFacilities = results.flatMap((r) => r.facilities);
  const allErrors = results.flatMap((r) => r.errors);

  console.log("\n" + "=".repeat(60));
  console.log(`スクレイピング結果: ${allFacilities.length} 件取得`);
  if (allErrors.length) {
    console.warn(`エラー: ${allErrors.length} 件`);
    allErrors.forEach((e) => console.warn(`  ✗ ${e}`));
  }

  // バリデーション
  let valid = 0;
  let invalid = 0;
  let saved = 0;
  let skipped = 0;

  for (const raw of allFacilities) {
    const facility = normalize(raw);
    const errors = validate(facility);

    if (errors.length) {
      console.warn(`  ✗ ${facility.name}: ${errors.join(", ")}`);
      invalid++;
      continue;
    }
    valid++;

    if (isDryRun) {
      console.log(`  [dry] ${facility.name} (${facility.parkingCategory}) @ ${facility.lat.toFixed(4)},${facility.lng.toFixed(4)}`);
      continue;
    }

    // 重複チェック
    const isDuplicate = await checkDuplicate(facility.name, facility.address);
    if (isDuplicate) {
      console.log(`  skip (重複): ${facility.name}`);
      skipped++;
      continue;
    }

    // 保存
    const result = await insertFacility(facility);
    if ("error" in result) {
      console.error(`  ✗ 保存失敗: ${facility.name} — ${result.error}`);
      invalid++;
    } else {
      console.log(`  ✓ 保存: ${facility.name}`);
      saved++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`完了: 有効=${valid} / 無効=${invalid} / 保存=${saved} / スキップ=${skipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
