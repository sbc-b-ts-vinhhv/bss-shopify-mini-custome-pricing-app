import { Rule } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { validateDiscountValue } from "../validators/rule.validator.js";
import type {
  RuleStatus,
  ProductConditionType,
  DiscountType,
} from "../models/Rule.js";

export interface CreateRuleInput {
  shopId: number;
  name: string;
  status?: RuleStatus;
  priority?: number;
  productConditionType: ProductConditionType;
  productTags?: string[];
  discountType: DiscountType;
  discountValue: number;
  endAt?: string | null;
}

function parseEndAt(endAt?: string | null): Date | null | undefined {
  if (endAt === undefined) {
    return undefined;
  }

  if (endAt === null) {
    return null;
  }

  const parsed = new Date(endAt);

  if (Number.isNaN(parsed.getTime())) {
    throw AppError.badRequest("Invalid endAt");
  }

  return parsed;
}

export interface UpdateRuleInput {
  name?: string;
  status?: RuleStatus;
  priority?: number;
  productConditionType?: ProductConditionType;
  productTags?: string[];
  discountType?: DiscountType;
  discountValue?: number;
  endAt?: string | null;
}

export async function createRule(data: CreateRuleInput) {
  return Rule.create({
    ...data,
    endAt: parseEndAt(data.endAt),
  });
}

export async function listRules(shopId?: number) {
  const where = shopId ? { shopId } : undefined;

  return Rule.findAll({ where, order: [["priority", "DESC"]] });
}

export async function getRuleById(id: number) {
  const rule = await Rule.findByPk(id);

  if (!rule) {
    throw AppError.notFound("Rule not found");
  }

  return rule;
}

export async function updateRule(id: number, data: UpdateRuleInput) {
  const rule = await Rule.findByPk(id);

  if (!rule) {
    throw AppError.notFound("Rule not found");
  }

  // discountType có thể không nằm trong payload, khi đó phải đối chiếu với giá trị đang lưu.
  if (data.discountValue !== undefined) {
    const discountError = validateDiscountValue(
      data.discountType ?? rule.discountType,
      data.discountValue,
    );

    if (discountError) {
      throw AppError.badRequest(discountError);
    }
  }

  await rule.update({
    ...data,
    endAt: parseEndAt(data.endAt),
  });

  return rule;
}

export async function duplicateRule(id: number) {
  const rule = await Rule.findByPk(id);

  if (!rule) {
    throw AppError.notFound("Rule not found");
  }

  return Rule.create({
    shopId: rule.shopId,
    name: `${rule.name} (copy)`,
    // Bản sao luôn tắt để không tác động giá storefront trước khi được xem lại.
    status: "disabled",
    priority: rule.priority,
    productConditionType: rule.productConditionType,
    productTags: rule.productTags,
    discountType: rule.discountType,
    discountValue: rule.discountValue,
    endAt: rule.endAt,
  });
}

export async function deleteRule(id: number) {
  const rule = await Rule.findByPk(id);

  if (!rule) {
    throw AppError.notFound("Rule not found");
  }

  await rule.destroy();
}
