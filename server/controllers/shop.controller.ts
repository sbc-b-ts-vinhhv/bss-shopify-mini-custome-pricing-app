import type { RouterContext } from "@koa/router";

import {
  createShop,
  getShopById,
  updateShop,
} from "../services/shop.services.js";
import { toShopDTO } from "../mappers/shop.mapper.js";
import { AppError } from "../utils/AppError.js";
import { ok } from "../utils/response.js";
import {
  validateCreateShopInput,
  validateUpdateShopInput,
} from "../validators/shop.validator.js";

function toShopId(value: unknown): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function getShopController(ctx: RouterContext) {
  const shopId = toShopId(ctx.params.id ?? ctx.query.id);

  if (shopId === null) {
    throw AppError.badRequest("Missing or invalid shop id");
  }

  const shop = await getShopById(shopId);

  ok(ctx, toShopDTO(shop));
}

export async function createShopController(ctx: RouterContext) {
  const body = validateCreateShopInput(ctx.request.body);

  const shop = await createShop({
    shop: body.shop,
    token: body.token,
    name: body.name,
    email: body.email,
    senderEmail: body.senderEmail,
  });

  ok(ctx, toShopDTO(shop), 201);
}

export async function updateShopController(ctx: RouterContext) {
  const shopId = toShopId(ctx.params.id ?? ctx.query.id);

  if (shopId === null) {
    throw AppError.badRequest("Missing or invalid shop id");
  }

  const data = validateUpdateShopInput(ctx.request.body);
  const shop = await updateShop(shopId, data);

  ok(ctx, toShopDTO(shop));
}
