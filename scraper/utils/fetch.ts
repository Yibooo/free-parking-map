// レート制限付き HTTP クライアント（ポライトクローリング）
const DELAY_MS = 1500;

let lastRequestTime = 0;

async function politeWait() {
  const elapsed = Date.now() - lastRequestTime;
  if (elapsed < DELAY_MS) {
    await new Promise((r) => setTimeout(r, DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function fetchHtml(url: string, retries = 2): Promise<string> {
  await politeWait();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FreeParking-Bot/1.0; +https://free-parking-map.vercel.app)",
          "Accept-Language": "ja,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  Retry ${attempt + 1}/${retries}: ${url}`);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error("fetchHtml: unreachable");
}
