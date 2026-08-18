import type { CPRule, MetafieldSyncStatus, RuleFormValues } from "../types/rule";
import { apiRequest } from "./api-client";

type RuleResponse = CPRule;

function toRuleRequestBody(values: RuleFormValues) {
  return {
    name: values.name.trim(),
    status: values.status,
    priority: Number(values.priority) || 0,
    productConditionType: values.productConditionType,
    productTags:
      values.productConditionType === "TAGS"
        ? values.tags.map((tag) => tag.trim()).filter(Boolean)
        : [],
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
  };
}

export async function getRules(): Promise<CPRule[]> {
  return apiRequest<RuleResponse[]>("/api/rules");
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
  return apiRequest<RuleResponse>("/api/rules", {
    method: "POST",
    body: JSON.stringify(toRuleRequestBody(values)),
  });
}

export async function updateRule(
  id: string,
  values: RuleFormValues,
): Promise<CPRule> {
  return apiRequest<RuleResponse>(`/api/rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toRuleRequestBody(values)),
  });
}

export async function deleteRule(
  id: string,
): Promise<{ id: string; metafieldSync?: MetafieldSyncStatus }> {
  // 204 khi sync OK, 200 { metafieldSync } khi sync fail — xem deleteRuleController.
  const result = await apiRequest<{ metafieldSync?: MetafieldSyncStatus } | null>(
    `/api/rules/${id}`,
    { method: "DELETE" },
  );

  return { id, metafieldSync: result?.metafieldSync };
}

export async function duplicateRule(id: string): Promise<CPRule> {
  return apiRequest<RuleResponse>(`/api/rules/${id}/duplicate`, {
    method: "POST",
  });
}
