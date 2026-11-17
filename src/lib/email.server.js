import { readFileSync } from "node:fs";
import { join } from "node:path";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

export function renderEmail(name, vars) {
  const html = readFileSync(join(process.cwd(), "emails", `${name}.html`), "utf8");
  const all = { app_url: process.env.APP_URL ?? "http://localhost:3000", ...vars };
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(all[k]));
}
