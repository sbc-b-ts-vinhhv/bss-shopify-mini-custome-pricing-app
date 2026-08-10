import type { CPRule, DiscountConfig, ProductCondition } from "../types/rule";

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