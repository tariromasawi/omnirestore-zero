#!/usr/bin/env node
import { readFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
mkdirSync("state", { recursive: true });
if (!existsSync("vault/catalog.json")) { console.error("run discover first"); process.exit(1); }
const catalog = JSON.parse(readFileSync("vault/catalog.json", "utf8"));
const once = process.argv.includes("--once");
async function pulse() {
  const results = [];
  for (const it of catalog.items.filter((x) => x.platform === "github" && x.status === "DISCOVERED")) {
    try {
      const res = await fetch(`https://api.github.com/repos/${it.full_name}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "zioncore-zero" } });
      results.push({ name: it.name, http: res.status, ok: res.ok });
    } catch (err) { results.push({ name: it.name, ok: false, error: String(err.message || err) }); }
  }
  appendFileSync("state/audit.log", JSON.stringify({ at: new Date().toISOString(), results }) + "\n");
  const down = results.filter((r) => !r.ok);
  console.log(`[ZionCore] ${results.length} checked, ${down.length} unavailable`);
  return results;
}
if (once) await pulse();
else { console.log("watching 60s"); await pulse(); setInterval(pulse, 60000); }
