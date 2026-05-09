import { query } from "./_generated/server";

export const scrapeStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("facilities")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const byCategory: Record<string, number> = {};
    const byParkingCategory: Record<string, number> = {};
    let verified = 0;
    let unverified = 0;

    for (const f of all) {
      byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
      byParkingCategory[f.parkingCategory] =
        (byParkingCategory[f.parkingCategory] ?? 0) + 1;
      if (f.isVerified) verified++;
      else unverified++;
    }

    return {
      total: all.length,
      byCategory,
      byParkingCategory,
      verified,
      unverified,
    };
  },
});
