import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  includes: text("includes", { mode: "json" }),
  imageUrls: text("image_urls", { mode: "json" }),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  rank: integer("rank").notNull().default(0),
});

export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  checkoutId: text("checkout_id").notNull().unique(),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name"),
  amountCents: integer("amount_cents"),
  currency: text("currency"),
  status: text("status").notNull().default("pending"),
  buyerEmail: text("buyer_email"),
  paidAt: text("paid_at"),
  createdDate: integer("created_date", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const clips = sqliteTable("clips", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("ai"),
  videoUrl: text("video_url"),
  videoId: text("video_id"),
  category: text("category").notNull(),
  note: text("note"),
  rank: integer("rank").notNull().default(0),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  channel: text("channel"),
  duration: text("duration"),
});
