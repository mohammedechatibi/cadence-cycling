import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

const toClip = (c) => ({
  id: c.id,
  title: c.title,
  kind: c.kind,
  video_url: c.videoUrl,
  video_id: c.videoId,
  category: c.category,
  note: c.note,
  rank: c.rank,
  featured: c.featured,
  channel: c.channel,
  duration: c.duration,
});

export const listClips = createServerFn({ method: "GET" }).handler(async () => {
  const { asc } = await import("drizzle-orm");
  const { db } = await import("./db.server.js");
  const { clips } = await import("../db/schema.js");
  const rows = await db.select().from(clips).orderBy(asc(clips.rank)).limit(200);
  return rows.map(toClip);
});

export const getClip = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    const { eq } = await import("drizzle-orm");
    const { db } = await import("./db.server.js");
    const { clips } = await import("../db/schema.js");
    const [row] = await db.select().from(clips).where(eq(clips.id, data.id));
    return row ? toClip(row) : null;
  });

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { eq, asc } = await import("drizzle-orm");
  const { db } = await import("./db.server.js");
  const { products } = await import("../db/schema.js");
  const rows = await db.select().from(products)
    .where(eq(products.active, true)).orderBy(asc(products.rank)).limit(50);
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    includes: p.includes ?? [],
    image_urls: p.imageUrls ?? [],
    price_cents: p.priceCents,
    currency: p.currency,
  }));
});

export const confirmPurchase = createServerFn({ method: "POST" })
  .validator(z.object({ checkoutId: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const { eq } = await import("drizzle-orm");
    const { default: Stripe } = await import("stripe");
    const { db } = await import("./db.server.js");
    const { purchases } = await import("../db/schema.js");
    const { markPaidAndDeliver } = await import("./purchases.server.js");

    const [record] = await db.select().from(purchases).where(eq(purchases.checkoutId, data.checkoutId));
    if (!record) return { status: "not_found", productName: "" };
    const productName = record.productName || "";
    if (record.status === "paid") return { status: "paid", productName };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(data.checkoutId);
    if (session.payment_status !== "paid") return { status: "pending", productName };

    await markPaidAndDeliver(record, session.customer_details?.email || "");
    return { status: "paid", productName };
  });
