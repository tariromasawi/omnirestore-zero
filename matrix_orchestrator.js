#!/usr/bin/env node
import { discoverGithub } from "./src/core/discover_github.js";
import { buildCatalog } from "./src/core/catalog.js";
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
const cmd = process.argv[2] || "help";
async function cmdDiscover() {
  const items = await discoverGithub();
  const catalog = buildCatalog(items, { plane: "discovery" });
  console.log(`Discovered ${catalog.count} items -> vault/catalog.json`);
}
function cmdContainerize() {
  const catalog = JSON.parse(readFileSync("vault/catalog.json", "utf8"));
  const plan = catalog.items.map((it) => ({
    name: it.name,
    suggestedImage: (it.language === "TypeScript" || it.language === "JavaScript") ? "Dockerfile.node" : it.language === "Python" ? "Dockerfile.python" : "Dockerfile.static",
    note: "Template only. No paid cluster."
  }));
  mkdirSync("vault/bundles", { recursive: true });
  writeFileSync("vault/bundles/container_plan.json", JSON.stringify(plan, null, 2));
  console.log(`Container plan written for ${plan.length} items.`);
}
function cmdReplicate() {
  mkdirSync("vault_mirror", { recursive: true });
  copyFileSync("vault/catalog.json", join("vault_mirror", "catalog.json"));
  writeFileSync("vault_mirror/replication_report.json", JSON.stringify({ plane: "filesystem_mirror + this GitHub repository", paidPlanesSkipped: ["aws_s3", "backblaze_b2", "cloudflare_r2", "pinata", "arweave"], at: new Date().toISOString() }, null, 2));
  console.log("Zero-cost replication complete.");
}
const map = { discover: cmdDiscover, containerize: cmdContainerize, replicate: cmdReplicate };
await (map[cmd] || (() => console.log("discover | containerize | replicate")))();
