import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    categories: v.optional(v.array(v.string())),
    parkingCategories: v.optional(v.array(v.string())),
    prefecture: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let facilities = await ctx.db
      .query("facilities")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.categories && args.categories.length > 0) {
      facilities = facilities.filter((f) =>
        args.categories!.includes(f.category)
      );
    }

    if (args.parkingCategories && args.parkingCategories.length > 0) {
      facilities = facilities.filter((f) =>
        args.parkingCategories!.includes(f.parkingCategory)
      );
    }

    if (args.prefecture) {
      facilities = facilities.filter((f) => f.prefecture === args.prefecture);
    }

    if (args.search && args.search.trim() !== "") {
      const q = args.search.toLowerCase();
      facilities = facilities.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q)
      );
    }

    return facilities;
  },
});

export const get = query({
  args: { id: v.id("facilities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const insert = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("complex"),
      v.literal("supermarket"),
      v.literal("museum"),
      v.literal("onsen"),
      v.literal("park"),
      v.literal("zoo"),
      v.literal("homeimprovement"),
      v.literal("cinema"),
      v.literal("farm"),
      v.literal("library"),
      v.literal("roadstop")
    ),
    address: v.string(),
    prefecture: v.string(),
    city: v.string(),
    lat: v.number(),
    lng: v.number(),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    hours: v.optional(v.string()),
    parkingCategory: v.union(
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
      v.literal("D"),
      v.literal("E")
    ),
    parkingDetails: v.object({
      totalSpaces: v.optional(v.number()),
      freeMinutes: v.optional(v.number()),
      freeCondition: v.optional(v.string()),
      paidRate: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("facilities", {
      ...args,
      scrapedAt: Date.now(),
      isVerified: false,
      isActive: true,
    });
  },
});
