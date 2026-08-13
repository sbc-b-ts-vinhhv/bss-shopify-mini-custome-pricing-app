import type { RouterContext } from "@koa/router";

import {
  createRule,
  listRules,
  getRuleById,
  updateRule,
  duplicateRule,
  deleteRule,
} from "../services/rule.services.js";
import { toRuleDTO } from "../mappers/rule.mapper.js";
import { AppError } from "../utils/AppError.js";
import { ok, noContent } from "../utils/response.js";
import {
  validateCreateRuleInput,
  validateUpdateRuleInput,
} from "../validators/rule.validator.js";

function toId(value: unknown): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createRuleController(ctx: RouterContext) {
  const body = validateCreateRuleInput(ctx.request.body);

  const rule = await createRule({
    shopId: body.shopId,
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
  const shopId = ctx.query.shopId ? toId(ctx.query.shopId) : undefined;

  if (ctx.query.shopId && shopId === null) {
    throw AppError.badRequest("Invalid shopId");
  }

  const rules = await listRules(shopId ?? undefined);

  ok(ctx, rules.map(toRuleDTO));
}

export async function getRuleController(ctx: RouterContext) {
  const id = toId(ctx.params.id);

  if (id === null) {
    throw AppError.badRequest("Missing or invalid rule id");
  }

  const rule = await getRuleById(id);

  ok(ctx, toRuleDTO(rule));
}

export async function updateRuleController(ctx: RouterContext) {
  const id = toId(ctx.params.id);

  if (id === null) {
    throw AppError.badRequest("Missing or invalid rule id");
  }

  const data = validateUpdateRuleInput(ctx.request.body);
  const rule = await updateRule(id, data);

  ok(ctx, toRuleDTO(rule));
}

export async function duplicateRuleController(ctx: RouterContext) {
  const id = toId(ctx.params.id);

  if (id === null) {
    throw AppError.badRequest("Missing or invalid rule id");
  }

  const rule = await duplicateRule(id);

  ok(ctx, toRuleDTO(rule), 201);
}

export async function deleteRuleController(ctx: RouterContext) {
  const id = toId(ctx.params.id);

  if (id === null) {
    throw AppError.badRequest("Missing or invalid rule id");
  }

  await deleteRule(id);

  noContent(ctx);
}
