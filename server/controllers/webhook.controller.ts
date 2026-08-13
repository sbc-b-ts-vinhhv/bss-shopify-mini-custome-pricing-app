import { RouterContext } from "@koa/router";
import { uninstallShop } from "server/services/shop.services.js";
import { AppError } from "server/utils/AppError.js";

export async function appUninstalledController(
  ctx: RouterContext,
) {
  const shopDomain = ctx.get("X-Shopify-Shop-Domain");

  if (!shopDomain) {
    throw AppError.badRequest(
      "Missing Shopify shop domain",
    );
  }

  await uninstallShop(shopDomain);

  ctx.status = 200;
}