"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FACILITY_CATEGORIES, PARKING_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

// 各カテゴリの目標件数
const SCRAPE_TARGETS: Record<string, number> = {
  roadstop:        5,
  park:           25,
  museum:         40,
  complex:        30,
  supermarket:    20,
  homeimprovement:15,
  onsen:          30,
  zoo:            10,
  cinema:         25,
  farm:           10,
  library:        15,
};

const TOTAL_TARGET = Object.values(SCRAPE_TARGETS).reduce((a, b) => a + b, 0);

// カテゴリ別の npm script 名
const SCRAPE_COMMANDS: Record<string, string> = {
  roadstop:        "npm run scrape:michinoeki",
  park:            "npm run scrape:parks",
  museum:          "npm run scrape:museums",
  complex:         "npm run scrape:commercial",
  supermarket:     "npm run scrape:commercial",
  homeimprovement: "npm run scrape:commercial",
  onsen:           "npm run scrape:onsen",
  zoo:             "npm run scrape:zoo",
  cinema:          "npm run scrape:cinema",
  farm:            "npm run scrape:farm",
  library:         "npm run scrape:library",
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ScrapingDashboard() {
  const stats = useQuery(api.stats.scrapeStats);

  const totalActual = stats?.total ?? 0;
  const totalPct = Math.min(100, Math.round((totalActual / TOTAL_TARGET) * 100));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← 地図に戻る</Link>
        <h1 className="font-bold text-lg">スクレイピング管理ダッシュボード</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* 総合進捗 */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500 mb-1">総施設数 / 目標</p>
              <p className="text-4xl font-bold text-slate-800">
                {totalActual}
                <span className="text-xl text-slate-400 font-normal"> / {TOTAL_TARGET}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">{totalPct}%</span>
              <p className="text-xs text-slate-400">達成率</p>
            </div>
          </div>
          <ProgressBar value={totalActual} max={TOTAL_TARGET} color="#16a34a" />

          {/* 認証状況 */}
          {stats && (
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <span className="text-slate-600">確認済み: <strong>{stats.verified}</strong> 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-600">未確認: <strong>{stats.unverified}</strong> 件</span>
              </div>
            </div>
          )}
        </div>

        {/* カテゴリ別進捗 */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-700">カテゴリ別進捗</h2>
            <p className="text-xs text-slate-400 mt-0.5">スクレイピングして Convex に保存した件数</p>
          </div>
          <div className="divide-y">
            {Object.entries(SCRAPE_TARGETS).map(([catKey, target]) => {
              const cat = FACILITY_CATEGORIES[catKey as keyof typeof FACILITY_CATEGORIES];
              const actual = stats?.byCategory[catKey] ?? 0;
              const pct = Math.min(100, Math.round((actual / target) * 100));
              const isDone = actual >= target;
              const cmd = SCRAPE_COMMANDS[catKey];

              return (
                <div key={catKey} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium text-sm text-slate-700">{cat.label}</span>
                      {isDone && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">完了</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded hidden sm:block">{cmd}</code>
                      <span className="text-sm font-semibold text-slate-700 w-20 text-right">
                        {actual} / {target} 件
                      </span>
                      <span
                        className="text-xs font-medium w-10 text-right"
                        style={{ color: isDone ? "#16a34a" : actual > 0 ? "#d97706" : "#94a3b8" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={actual}
                    max={target}
                    color={isDone ? "#16a34a" : actual > 0 ? "#d97706" : "#e2e8f0"}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 駐車場区分分布 */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-700">駐車場区分 分布</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {Object.entries(PARKING_CATEGORIES).map(([key, val]) => {
              const count = stats?.byParkingCategory[key] ?? 0;
              const pct = totalActual > 0 ? Math.round((count / totalActual) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: val.color }}
                  >
                    {key}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{val.label}</span>
                      <span className="font-medium">{count} 件（{pct}%）</span>
                    </div>
                    <ProgressBar value={count} max={Math.max(totalActual, 1)} color={val.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* スクレイピング実行ガイド */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white">
          <h2 className="font-semibold mb-3 text-slate-200">スクレイピング実行コマンド</h2>
          <div className="space-y-1.5 text-sm font-mono">
            {[
              ["全ソース dry-run（確認用）", "npm run scrape:dry"],
              ["道の駅（5件・約10秒）", "npm run scrape:michinoeki"],
              ["都立公園（25件・約1分）", "npm run scrape:parks"],
              ["博物館・美術館（40件・約2分）", "npm run scrape:museums"],
              ["商業施設（50件・約2.5分）", "npm run scrape:commercial"],
              ["温泉・銭湯（30件・約1.5分）", "npm run scrape:onsen"],
              ["動物園・水族館（10件・約20秒）", "npm run scrape:zoo"],
              ["映画館・レジャー（25件・約1分）", "npm run scrape:cinema"],
              ["農産物直売所（10件・約20秒）", "npm run scrape:farm"],
              ["図書館・公共施設（15件・約40秒）", "npm run scrape:library"],
            ].map(([label, cmd]) => (
              <div key={cmd} className="flex gap-3 items-start">
                <span className="text-slate-400 shrink-0 w-48 truncate"># {label}</span>
                <code className="text-green-400">{cmd}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            ※ Nominatim (OpenStreetMap) の利用規約に基づき、1.2秒/リクエストのレート制限を設けています
          </p>
        </div>

      </main>
    </div>
  );
}
