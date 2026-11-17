import { readFileSync } from "node:fs";
import { db } from "../src/lib/db.server.js";
import { products, clips } from "../src/db/schema.js";

const [kind, file] = process.argv.slice(2);
let rows = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(rows)) rows = rows.items ?? rows.data ?? [];

if (kind === "product") {
  for (const r of rows) {
    db.insert(products).values({
      id: r.id, name: r.name, tagline: r.tagline, description: r.description,
      includes: r.includes ?? [], imageUrls: r.image_urls ?? [],
      priceCents: Math.round(r.price_cents), currency: r.currency || "EUR",
      active: r.active !== false, rank: Math.round(r.rank ?? 0),
    }).run();
  }
} else if (kind === "clip") {
  for (const r of rows) {
    db.insert(clips).values({
      id: r.id, title: r.title, kind: r.kind || "ai", videoUrl: r.video_url,
      videoId: r.video_id, category: r.category, note: r.note, rank: Math.round(r.rank ?? 0),
      featured: !!r.featured, channel: r.channel, duration: r.duration,
    }).run();
  }
}
console.log(`imported ${rows.length} ${kind} rows`);
