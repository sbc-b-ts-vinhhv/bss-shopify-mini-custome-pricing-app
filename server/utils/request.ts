import type { RouterContext } from "@koa/router";

import { AppError } from "./AppError.js";

/**
 * Shop domain do route proxy `app/routes/api.$.tsx` gắn vào từ session
 * Shopify, không phải do browser tự khai.
 */
export function requireShopDomain(ctx: RouterContext): string {
  const shopDomain = ctx.get("X-Shopify-Shop-Domain");

  if (!shopDomain) {
    throw AppError.badRequest("Missing X-Shopify-Shop-Domain header");
  }

  return shopDomain;
}
