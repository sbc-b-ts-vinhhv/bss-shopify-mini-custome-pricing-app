import type { RouterContext } from "@koa/router";

import {
  createShop,
  getShopById,
  updateShop,
  type CreateShopInput,
  type UpdateShopInput,
} from "../services/shop.services.js";
import { toShopDTO } from "../mappers/shop.mapper.js";
import { AppError } from "../utils/AppError.js";
import { ok } from "../utils/response.js";

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
    throw AppError.badRequest("Missing or invalid shop id");
  }

  const shop = await getShopById(shopId);

  ok(ctx, toShopDTO(shop));
}

export async function createShopController(ctx: RouterContext) {
  if (!isRecord(ctx.request.body)) {
    throw AppError.badRequest("Request body is required");
  }

  const body = ctx.request.body as Partial<CreateShopInput>;

  if (!body.shop || !body.token || !body.name) {
    throw AppError.badRequest("shop, token, and name are required");
  }

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

  if (!isRecord(ctx.request.body)) {
    throw AppError.badRequest("Request body is required");
  }

  const data = ctx.request.body as UpdateShopInput;
  const shop = await updateShop(shopId, data);

  ok(ctx, toShopDTO(shop));
}
