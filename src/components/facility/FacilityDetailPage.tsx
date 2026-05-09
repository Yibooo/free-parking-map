"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PARKING_CATEGORIES, FACILITY_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = { id: string };

export function FacilityDetailPage({ id }: Props) {
  const facility = useQuery(api.facilities.get, {
    id: id as Id<"facilities">,
  });

  if (facility === undefined) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (facility === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">施設が見つかりません</p>
        <Link href="/"><Button variant="outline">地図に戻る</Button></Link>
      </div>
    );
  }

  const parking = PARKING_CATEGORIES[facility.parkingCategory];
  const category = FACILITY_CATEGORIES[facility.category];
  const { parkingDetails: pd } = facility;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm">← 地図に戻る</Button>
        </Link>
        <h1 className="font-bold text-base truncate">{facility.name}</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* 基本情報 */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold">{facility.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {category.icon} {category.label}
              </p>
            </div>
            <Badge
              className="text-white text-sm shrink-0"
              style={{ backgroundColor: parking.color }}
            >
              区分 {facility.parkingCategory}
            </Badge>
          </div>

          <div className="space-y-1 text-sm">
            <p>📍 {facility.address}</p>
            {facility.hours && <p>🕐 {facility.hours}</p>}
            {facility.phone && <p>📞 {facility.phone}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            {facility.website && (
              <a href={facility.website} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">公式サイト</Button>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">Google Maps</Button>
            </a>
          </div>
        </div>

        {/* 駐車場情報 */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h3 className="font-semibold">🅿️ 駐車場情報</h3>
          <div
            className="rounded-lg p-3 text-sm font-medium"
            style={{ backgroundColor: `${parking.color}18`, color: parking.color }}
          >
            区分 {facility.parkingCategory}：{parking.label}<br />
            <span className="font-normal text-xs">{parking.description}</span>
          </div>

          <dl className="space-y-2 text-sm">
            {pd.totalSpaces && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">総台数</dt>
                <dd>{pd.totalSpaces} 台</dd>
              </div>
            )}
            {pd.freeCondition && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">無料条件</dt>
                <dd>{pd.freeCondition}</dd>
              </div>
            )}
            {pd.freeMinutes && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">無料時間</dt>
                <dd>{pd.freeMinutes >= 60
                  ? `${Math.floor(pd.freeMinutes / 60)}時間${pd.freeMinutes % 60 > 0 ? `${pd.freeMinutes % 60}分` : ""}`
                  : `${pd.freeMinutes}分`}
                </dd>
              </div>
            )}
            {pd.paidRate && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">有料料金</dt>
                <dd>{pd.paidRate}</dd>
              </div>
            )}
            {pd.notes && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground w-24 shrink-0">備考</dt>
                <dd>{pd.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* データ情報 */}
        <div className="text-xs text-muted-foreground text-center pb-4">
          データ取得元：{facility.source}　/
          最終更新：{new Date(facility.scrapedAt).toLocaleDateString("ja-JP")}
          {!facility.isVerified && "　⚠️ 未確認データ"}
        </div>
      </main>
    </div>
  );
}
