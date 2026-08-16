import type { RouterContext } from "@koa/router";

import { uninstallShop } from "../services/shop.services.js";
import { requireShopDomain } from "../utils/request.js";
import { ok } from "../utils/response.js";

/**
 * Shopify có thể bắn lại webhook nhiều lần, kể cả sau khi shop đã bị gỡ khỏi
 * DB. Controller này vì vậy idempotent: shop không tồn tại vẫn trả 200, để
 * Shopify không retry rồi cuối cùng huỷ đăng ký webhook.
 */
export async function appUninstalledController(ctx: RouterContext) {
  const shopDomain = requireShopDomain(ctx);

  const shop = await uninstallShop(shopDomain);

  ok(ctx, { shop: shopDomain, uninstalled: shop !== null });
}