/**
 * Convex HTTP API 経由でデータを保存するクライアント
 * (ConvexReactClient はブラウザ専用のため、スクレイパーから HTTP で直接 mutation を呼ぶ)
 */
import type { ScrapedFacility } from "./types";

function getConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL が未設定です。.env.local を確認してください。");
  }
  return url;
}

type InsertResult = { id: string } | { error: string };

export async function insertFacility(
  facility: ScrapedFacility
): Promise<InsertResult> {
  const res = await fetch(`${getConvexUrl()}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "facilities:insert",
      args: facility,
      format: "json",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
  }

  const data = await res.json();
  return { id: data.value ?? data.id ?? "ok" };
}

export async function checkDuplicate(name: string, address: string): Promise<boolean> {
  const res = await fetch(`${getConvexUrl()}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: "facilities:list",
      args: { search: name },
      format: "json",
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  const results = data.value ?? [];
  return results.some(
    (f: { name: string; address: string }) =>
      f.name === name || f.address === address
  );
}
