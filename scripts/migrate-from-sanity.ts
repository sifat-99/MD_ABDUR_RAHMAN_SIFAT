import fs from "fs";
import path from "path";

// Load .env.local before running migration
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["\x27](.*)["\x27]$/, "$1");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

import { migrateFromSanity } from "../lib/sanity-migration";

async function main() {
  console.log("🚀 Starting Sanity CMS to Firebase & MongoDB Migration...\n");
  const result = await migrateFromSanity();

  if (result.success) {
    console.log("✅ " + result.message);
    console.log("\n📊 Migration Breakdown:");
    Object.entries(result.counts).forEach(([type, count]) => {
      console.log(`  - ${type.padEnd(16)}: ${count} items`);
    });
    console.log("\n🎉 All Sanity data successfully migrated!");
    process.exit(0);
  } else {
    console.error("❌ Migration failed:", result.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
