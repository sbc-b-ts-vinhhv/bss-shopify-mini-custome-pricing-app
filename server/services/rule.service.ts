import { Rule } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { validateDiscountValue } from "../validators/rule.validator.js";
import type {
  RuleStatus,
  ProductConditionType,
  DiscountType,
} from "../models/Rule.js";

import { safeSyncRulesToMetafield } from "./metafield.service.js";

export interface CreateRuleInput {
  shopId: number;
  name: string;
  status?: RuleStatus;
  priority?: number;
  productConditionType: ProductConditionType;
  productTags?: string[];
  discountType: DiscountType;
  discountValue: number;
}

export interface UpdateRuleInput {
  name?: string;
  status?: RuleStatus;
  priority?: number;
  productConditionType?: ProductConditionType;
  productTags?: string[];
  discountType?: DiscountType;
  discountValue?: number;
}

export async function createRule(data: CreateRuleInput) {
  const rule = await Rule.create(data);

  const metafieldSync = await safeSyncRulesToMetafield(data.shopId);

  return { rule, metafieldSync };
}

export async function listRules(shopId: number) {
  return Rule.findAll({ where: { shopId }, order: [["priority", "DESC"]] });
}

// Mọi truy vấn theo id đều đi qua đây, nên không có đường nào đọc/sửa được
// rule của shop khác — kể cả khi client đoán đúng id.
export async function getRuleById(id: number, shopId: number) {
  const rule = await Rule.findOne({ where: { id, shopId } });

  if (!rule) {
    throw AppError.notFound("Rule not found");
  }

  return rule;
}

export async function updateRule(
  id: number,
  shopId: number,
  data: UpdateRuleInput,
) {
  const rule = await getRuleById(id, shopId);

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

  await rule.update(data);

  const metafieldSync = await safeSyncRulesToMetafield(shopId);

  return { rule, metafieldSync };
}

export async function duplicateRule(id: number, shopId: number) {
  const rule = await getRuleById(id, shopId);

  const copy = await Rule.create({
    shopId: rule.shopId,
    name: `${rule.name} (copy)`,
    // Bản sao luôn tắt để không tác động giá storefront trước khi được xem lại.
    status: "disabled",
    priority: rule.priority,
    productConditionType: rule.productConditionType,
    productTags: rule.productTags,
    discountType: rule.discountType,
    discountValue: rule.discountValue,
  });

  // Bản sao luôn disabled nên payload không đổi — vẫn sync để không phải nhớ
  // sửa chỗ này nếu sau đó default status của bản sao thay đổi.
  const metafieldSync = await safeSyncRulesToMetafield(shopId);

  return { rule: copy, metafieldSync };
}

export async function deleteRule(id: number, shopId: number) {
  const rule = await getRuleById(id, shopId);

  await rule.destroy();

  return safeSyncRulesToMetafield(shopId);
}