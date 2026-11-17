// Usage: node scripts/import.mjs <product|clip> <file.json>
// Safe to re-run: rows whose id already exists are skipped.
import { readFileSync } from "node:fs";
import { db } from "../src/lib/db.server.js";
import { products, clips } from "../src/db/schema.js";

const [kind, file] = process.argv.slice(2);
if (!["product", "clip"].includes(kind) || !file) {
  console.error("Usage: node scripts/import.mjs <product|clip> <file.json>");
  process.exit(1);
}

let rows = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(rows)) rows = rows.items ?? rows.data ?? [];

let inserted = 0;
if (kind === "product") {
  for (const r of rows) {
    const res = db.insert(products).values({
      id: r.id, name: r.name, tagline: r.tagline, description: r.description,
      includes: r.includes ?? [], imageUrls: r.image_urls ?? [],
      priceCents: Math.round(r.price_cents), currency: r.currency || "EUR",
      active: r.active !== false, rank: Math.round(r.rank ?? 0),
    }).onConflictDoNothing().run();
    inserted += res.changes;
  }
} else {
  for (const r of rows) {
    const res = db.insert(clips).values({
      id: r.id, title: r.title, kind: r.kind || "ai", videoUrl: r.video_url,
      videoId: r.video_id, category: r.category, note: r.note, rank: Math.round(r.rank ?? 0),
      featured: !!r.featured, channel: r.channel, duration: r.duration,
    }).onConflictDoNothing().run();
    inserted += res.changes;
  }
}
console.log(`${kind}: ${inserted} inserted, ${rows.length - inserted} skipped (of ${rows.length})`);
