import type { RouterContext } from "@koa/router";

import {
  createRule,
  listRules,
  getRuleById,
  updateRule,
  duplicateRule,
  deleteRule,
} from "../services/rule.service.js";
import { getShopByDomain } from "../services/shop.service.js";
import { toRuleDTO } from "../mappers/rule.mapper.js";
import { AppError } from "../utils/AppError.js";
import { requireShopDomain } from "../utils/request.js";
import { ok, noContent } from "../utils/response.js";
import {
  validateCreateRuleInput,
  validateUpdateRuleInput,
} from "../validators/rule.validator.js";
import { syncRulesToMetafield } from "../services/metafield.service.js";

function toId(value: unknown): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * shopId KHÔNG bao giờ đến từ client. Nó suy ra từ shop domain mà proxy
 * `app/routes/api.$.tsx` gắn vào từ session Shopify.
 */
async function requireShopId(ctx: RouterContext): Promise<number> {
  const shop = await getShopByDomain(requireShopDomain(ctx));

  return shop.id;
}

function requireRuleId(ctx: RouterContext): number {
  const id = toId(ctx.params.id);

  if (id === null) {
    throw AppError.badRequest("Missing or invalid rule id");
  }

  return id;
}

export async function createRuleController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);
  const body = validateCreateRuleInput(ctx.request.body);

  const rule = await createRule({
    shopId,
    name: body.name,
    status: body.status,
    priority: body.priority,
    productConditionType: body.productConditionType,
    productTags: body.productTags,
    discountType: body.discountType,
    discountValue: body.discountValue,
    endAt: body.endAt,
  });

  ok(ctx, toRuleDTO(rule), 201);
}

export async function listRulesController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);

  const rules = await listRules(shopId);

  ok(ctx, rules.map(toRuleDTO));
}

export async function getRuleController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);

  const rule = await getRuleById(requireRuleId(ctx), shopId);

  ok(ctx, toRuleDTO(rule));
}

export async function updateRuleController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);
  const data = validateUpdateRuleInput(ctx.request.body);

  const rule = await updateRule(requireRuleId(ctx), shopId, data);

  ok(ctx, toRuleDTO(rule));
}

export async function duplicateRuleController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);

  const rule = await duplicateRule(requireRuleId(ctx), shopId);

  ok(ctx, toRuleDTO(rule), 201);
}

export async function deleteRuleController(ctx: RouterContext) {
  const shopId = await requireShopId(ctx);

  await deleteRule(requireRuleId(ctx), shopId);

  noContent(ctx);
}

/**
 * Backfill thủ công. Khác với sync trong vòng đời rule ở chỗ hàm này KHÔNG nuốt
 * lỗi — gọi tay thì cần thấy lỗi thật để biết vì sao metafield lệch.
 */
export async function syncMetafieldController(ctx: RouterContext) {
  const shopDomain = requireShopDomain(ctx);

  const result = await syncRulesToMetafield(shopDomain);

  ok(ctx, result);
}