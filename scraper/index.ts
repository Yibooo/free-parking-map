#!/usr/bin/env node
/**
 * 無料駐車場マップ スクレイパー CLI
 *
 * 使い方:
 *   npx tsx scraper/index.ts [--source <source>] [--dry-run]
 *
 * --source オプション:
 *   michinoeki | parks | museums | commercial | onsen | zoo | cinema | farm | library | all
 *   (デフォルト: all)
 *
 * --dry-run: Convex に保存せず結果を標準出力のみ
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { scrapeMichiNoEki } from "./sources/michinoeki";
import { scrapeParks } from "./sources/parks";
import { scrapeMuseums } from "./sources/museums";
import { scrapeCommercial } from "./sources/complexes";
import { scrapeOnsen } from "./sources/onsen";
import { scrapeZoos } from "./sources/zoo";
import { scrapeCinemas } from "./sources/cinema";
import { scrapeFarms } from "./sources/farm";
import { scrapeLibraries } from "./sources/library";
import { validate, normalize } from "./validator";
import { insertFacility, checkDuplicate } from "./client";
import type { ScrapeResult } from "./types";

const SOURCES: Record<string, () => Promise<ScrapeResult>> = {
  michinoeki: scrapeMichiNoEki,
  parks: scrapeParks,
  museums: scrapeMuseums,
  commercial: scrapeCommercial,
  onsen: scrapeOnsen,
  zoo: scrapeZoos,
  cinema: scrapeCinemas,
  farm: scrapeFarms,
  library: scrapeLibraries,
};

const args = process.argv.slice(2);
const sourceArg =
  args.find((a) => a.startsWith("--source="))?.split("=")[1] ??
  (args.includes("--source") ? args[args.indexOf("--source") + 1] : "all");
const isDryRun = args.includes("--dry-run");

async function main() {
  const targets =
    sourceArg === "all" ? Object.keys(SOURCES) : [sourceArg];

  const invalidSource = targets.find((s) => !SOURCES[s]);
  if (invalidSource) {
    console.error(`Unknown source: ${invalidSource}`);
    console.error(`Valid sources: ${Object.keys(SOURCES).join(" | ")} | all`);
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("無料駐車場マップ スクレイパー起動");
  console.log(`  ソース  : ${targets.join(", ")}`);
  console.log(`  dry-run : ${isDryRun}`);
  console.log(`  Convex  : ${process.env.NEXT_PUBLIC_CONVEX_URL}`);
  console.log("=".repeat(60));

  const results: ScrapeResult[] = [];

  for (const source of targets) {
    results.push(await SOURCES[source]());
  }

  const allFacilities = results.flatMap((r) => r.facilities);
  const allErrors = results.flatMap((r) => r.errors);

  console.log("\n" + "=".repeat(60));
  console.log(`スクレイピング結果: ${allFacilities.length} 件取得`);
  if (allErrors.length) {
    console.warn(`エラー: ${allErrors.length} 件`);
    allErrors.forEach((e) => console.warn(`  ✗ ${e}`));
  }

  let valid = 0, invalid = 0, saved = 0, skipped = 0;

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
      console.log(
        `  [dry] ${facility.name} (${facility.parkingCategory}) @ ${facility.lat.toFixed(4)},${facility.lng.toFixed(4)}`
      );
      continue;
    }

    const isDuplicate = await checkDuplicate(facility.name, facility.address);
    if (isDuplicate) {
      console.log(`  skip (重複): ${facility.name}`);
      skipped++;
      continue;
    }

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
  console.log(
    `完了: 有効=${valid} / 無効=${invalid} / 保存=${saved} / スキップ=${skipped}`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
