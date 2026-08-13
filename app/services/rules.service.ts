import type { CPRule, RuleFormValues } from "../types/rule";
import { getShop } from "./shop.service";
import { apiRequest } from "./api-client";

type RuleResponse = CPRule;

async function getCurrentShopId() {
  const shop = await getShop();

  return Number(shop.id);
}

function toRuleRequestBody(values: RuleFormValues, shopId: number) {
  return {
    shopId,
    name: values.name.trim(),
    status: values.status,
    productConditionType: values.productConditionType,
    productTags: values.productConditionType === "TAGS"
      ? values.tags.map((tag) => tag.trim()).filter(Boolean)
      : [],
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
  };
}

export async function getRules(): Promise<CPRule[]> {
  const shopId = await getCurrentShopId();

  return apiRequest<RuleResponse[]>(
    `/api/rules${Number.isFinite(shopId) ? `?shopId=${shopId}` : ""}`,
  );
}

export async function getRuleById(id: string): Promise<CPRule | undefined> {
  try {
    return await apiRequest<RuleResponse>(`/api/rules/${id}`);
  } catch (error) {
    if (error instanceof Error && /status 404/.test(error.message)) {
      return undefined;
    }

    throw error;
  }
}

export async function createRule(values: RuleFormValues): Promise<CPRule> {
  const shopId = await getCurrentShopId();

  return apiRequest<RuleResponse>("/api/rules", {
    method: "POST",
    body: JSON.stringify(toRuleRequestBody(values, shopId)),
  });
}

export async function updateRule(id: string, values: RuleFormValues): Promise<CPRule> {
  return apiRequest<RuleResponse>(`/api/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: values.name.trim(),
      status: values.status,
      productConditionType: values.productConditionType,
      productTags:
        values.productConditionType === "TAGS"
          ? values.tags.map((tag) => tag.trim()).filter(Boolean)
          : [],
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
    }),
  });
}

export async function deleteRule(id: string): Promise<{ id: string }> {
  await apiRequest<void>(`/api/rules/${id}`, {
    method: "DELETE",
  });

  return { id };
}

export async function duplicateRule(id: string): Promise<CPRule> {
  return apiRequest<RuleResponse>(`/api/rules/${id}/duplicate`, {
    method: "POST",
  });
}
