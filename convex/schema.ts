import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  facilities: defineTable({
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
    scrapedAt: v.number(),
    isVerified: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_parkingCategory", ["parkingCategory"])
    .index("by_prefecture", ["prefecture"])
    .index("by_active", ["isActive"]),
});
