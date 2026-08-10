import { ChoiceListProps } from "@shopify/polaris";
import type { CPRule, DiscountConfig, ProductCondition, RuleStatus } from "../types/rule";

export const discountTypeOptions: ChoiceListProps["choices"] = [
  {
    label: "Apply a price to selected products/variants",
    value: "FIXED_PRICE",
  },
  {
    label: "Decrease a fixed amount off the original price",
    value: "DECREASE_FIXED",
  },
  {
    label: "Decrease the original price by a percentage (%)",
    value: "DECREASE_PERCENTAGE",
  },
];

export const productConditionOptions: ChoiceListProps["choices"] = [
  {
    label: "All products",
    value: "ALL",
  },
  {
    label: "Product tags",
    value: "TAGS",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatApplyTo(condition: ProductCondition): string {
  if (condition.type === "ALL") {
    return "All products";
  }

  if (condition.tags.length === 0) {
    return "Product tags";
  }

  return `Product tags: ${condition.tags.join(", ")}`;
}

export function formatDiscount(discount: DiscountConfig): string {
  switch (discount.type) {
    case "FIXED_PRICE":
      return `Fixed price: ${currencyFormatter.format(discount.value)}`;

    case "DECREASE_FIXED":
      return `-${currencyFormatter.format(discount.value)}`;

    case "DECREASE_PERCENTAGE":
      return `-${discount.value}%`;
  }
}

export function getRuleDisplayData(rule: CPRule) {
  return {
    applyTo: formatApplyTo(rule.productCondition),
    discount: formatDiscount(rule.discount),
  };
}

export const formatDate = (date: string) => {
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export function statusSelectValue(status: RuleStatus) {
  return status === "enabled" ? "enabled" : "disabled";
}

export function statusBadgeTone(status: RuleStatus) {
  return status === "enabled" ? "success" : "critical";
}