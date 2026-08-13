import type { RouterContext } from "@koa/router";

import {
  createShop,          
  getShopById,
  updateShop,
  type CreateShopInput,
  type UpdateShopInput,
} from "../services/shop.services.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toShopId(value: unknown): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getShopController(ctx: RouterContext) {
  const shopId = toShopId(ctx.params.id ?? ctx.query.id);

  if (shopId === null) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Missing or invalid shop id",
    };

    return;
  }

  const shop = await getShopById(shopId);

  if (!shop) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: "Shop not found",
    };

    return;
  }

  ctx.body = {
    success: true,
    data: shop,
  };
}

export async function createShopController(ctx: RouterContext) {
  if (!isRecord(ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Request body is required",
    };

    return;
  }

  const body = ctx.request.body as Partial<CreateShopInput>;

  if (!body.shopifyShopId || !body.shopifyDomain || !body.name) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "shopifyShopId, shopifyDomain, and name are required",
    };

    return;
  }

  const shop = await createShop({
    shopifyShopId: body.shopifyShopId,
    shopifyDomain: body.shopifyDomain,
    name: body.name,
    email: body.email,
    firstName: body.firstName,
    currency: body.currency,
  });

  ctx.status = 201;
  ctx.body = {
    success: true,
    data: shop,
  };
}

export async function updateShopController(ctx: RouterContext) {
  const shopId = toShopId(ctx.params.id ?? ctx.query.id);

  if (shopId === null) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Missing or invalid shop id",
    };

    return;
  }

  if (!isRecord(ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Request body is required",
    };

    return;
  }

  const data = ctx.request.body as UpdateShopInput;
  const shop = await updateShop(shopId, data);

  if (!shop) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: "Shop not found",
    };

    return;
  }

  ctx.body = {
    success: true,
    data: shop,
  };
}
