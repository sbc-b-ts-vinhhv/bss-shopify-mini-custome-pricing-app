import { mockRules } from "../mocks/mock-data";
import type { CPRule, RuleFormValues } from "../types/rule";
import { delay } from "./delay";

let rulesStore: CPRule[] = [...mockRules];

function toRulePayload(values: RuleFormValues): CPRule {
  const now = new Date().toISOString();

  return {
    id: `rule_${crypto.randomUUID()}`,
    name: values.name.trim(),
    status: values.status,
    productCondition: {
      type: values.productConditionType,
      tags: values.tags,
    },
    discount: {
      type: values.discountType,
      value: Number(values.discountValue),
    },
    createdAt: now,
    updatedAt: now,
  };
}

export async function getRules(): Promise<CPRule[]> {
  return delay([...rulesStore]);
}

export async function getRuleById(id: string): Promise<CPRule | undefined> {
  const rule = rulesStore.find((item) => item.id === id);
  return delay(rule);
}

export async function createRule(values: RuleFormValues): Promise<CPRule> {
  const newRule = toRulePayload(values);
  rulesStore = [newRule, ...rulesStore];
  return delay(newRule);
}

export async function updateRule(id: string, values: RuleFormValues): Promise<CPRule> {
  const existing = rulesStore.find((item) => item.id === id);

  if (!existing) {
    throw new Error("Rule not found");
  }

  const updated: CPRule = {
    ...existing,
    name: values.name.trim(),
    status: values.status,
    productCondition: {
      type: values.productConditionType,
      tags: values.tags,
    },
    discount: {
      type: values.discountType,
      value: Number(values.discountValue),
    },
    updatedAt: new Date().toISOString(),
  };

  rulesStore = rulesStore.map((item) => (item.id === id ? updated : item));
  return delay(updated);
}

export async function deleteRule(id: string): Promise<{ id: string }> {
  rulesStore = rulesStore.filter((item) => item.id !== id);
  return delay({ id });
}

export async function duplicateRule(id: string): Promise<CPRule> {
  const original = rulesStore.find((item) => item.id === id);

  if (!original) {
    throw new Error("Rule not found");
  }

  const now = new Date().toISOString();
  const duplicated: CPRule = {
    ...original,
    id: `rule_${crypto.randomUUID()}`,
    name: `${original.name} Copy`,
    createdAt: now,
    updatedAt: now,
  };

  rulesStore = [duplicated, ...rulesStore];
  return delay(duplicated);
}