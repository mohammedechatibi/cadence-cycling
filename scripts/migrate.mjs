import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = process.env.DATABASE_URL ?? "./data/app.db";
mkdirSync(dirname(dbPath), { recursive: true });

// Imported after the directory exists, since opening the DB creates the file.
const { db } = await import("../src/lib/db.server.js");
migrate(db, { migrationsFolder: "./drizzle" });
console.log(`migrations applied to ${dbPath}`);
