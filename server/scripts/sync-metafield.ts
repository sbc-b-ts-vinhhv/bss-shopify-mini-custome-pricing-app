import "dotenv/config";

import { sequelize } from "../config/database.js";
import { syncRulesToMetafield } from "../services/metafield.service.js";

const shopDomain = process.argv[2];

if (!shopDomain) {
  console.error("Usage: npx tsx server/scripts/sync-metafield.ts <shop>.myshopify.com");
  process.exit(1);
}

try {
  console.log(await syncRulesToMetafield(shopDomain));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}