import type { RouterContext } from "@koa/router";

import { requireShopDomain } from "../utils/request.js";
import { ok } from "../utils/response.js";

import { getShopByDomain, uninstallShop } from "../services/shop.service.js";
import { syncShopFromShopify } from "../services/shopify.service.js";

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

/**
 * Shopify bắn shop/update mỗi khi merchant đổi bất kỳ setting nào của store,
 * nên hàm này chạy khá thường xuyên. Shop đã gỡ app thì bỏ qua: token trong
 * DB lúc đó là token chết, gọi Shopify chỉ tổ nhận 401.
 */
export async function shopUpdateController(ctx: RouterContext) {
  const shopDomain = requireShopDomain(ctx);

  const shop = await getShopByDomain(shopDomain);

  if (shop.status === "uninstalled") {
    ok(ctx, { shop: shopDomain, synced: false });
    return;
  }

  const updated = await syncShopFromShopify(shopDomain);

  ok(ctx, { shop: shopDomain, synced: true, email: updated.email });
}