// Nominatim (OpenStreetMap) 無料ジオコーダー
// 利用規約: https://operations.osmfoundation.org/policies/nominatim/

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const cache = new Map<string, { lat: number; lng: number } | null>();

async function nominatimSearch(q: string): Promise<{ lat: number; lng: number } | null> {
  await new Promise((r) => setTimeout(r, 1200)); // 1req/s 制限を遵守

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
    countrycodes: "jp",
    "accept-language": "ja",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "FreeParking-Bot/1.0 (+https://free-parking-map.vercel.app)",
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimResult[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/**
 * 住所または施設名から座標を取得。
 * 失敗時は施設名＋市区町村で再試行。
 */
export async function geocode(
  address: string,
  fallbackQuery?: string
): Promise<{ lat: number; lng: number } | null> {
  const cacheKey = fallbackQuery ?? address;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  // 1. 住所で検索
  let result = await nominatimSearch(address);

  // 2. 失敗したら住所の番地を除いて再検索
  if (!result) {
    const simplified = address.replace(/\d+-\d+-\d+$/, "").replace(/\d+$/, "").trim();
    if (simplified !== address) result = await nominatimSearch(simplified);
  }

  // 3. fallbackQuery（施設名など）で再検索
  if (!result && fallbackQuery) {
    result = await nominatimSearch(fallbackQuery);
  }

  cache.set(cacheKey, result);
  return result;
}
