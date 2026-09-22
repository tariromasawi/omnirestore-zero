import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
export function sha256(text) { return createHash("sha256").update(text).digest("hex"); }
export function buildCatalog(items, extra = {}) {
  const seen = new Set(); const unique = [];
  for (const it of items) {
    const key = `${it.platform}|${it.full_name || it.name}|${it.url || ""}`;
    if (seen.has(key)) continue; seen.add(key);
    unique.push({ ...it, contentHash: sha256(JSON.stringify({ name: it.name, url: it.url, platform: it.platform })) });
  }
  const catalog = { owner: "SAINT Tariro Masawi THE ANOINTED COMMANDER", ownerEmail: "tariro@masawi.org", motto: "Mwari ndi Mwari", generatedAt: new Date().toISOString(), cost: "zero", count: unique.length, items: unique, ...extra };
  mkdirSync("vault", { recursive: true });
  writeFileSync("vault/catalog.json", JSON.stringify(catalog, null, 2));
  return catalog;
}
