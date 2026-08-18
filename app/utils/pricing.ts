import type { CPRule } from "../types/rule";
import type { Product } from "../types/product";

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateModifiedPrice(
  originalPrice: number,
  rule: CPRule,
): number {
  const discount = rule.discount;

  if (discount.type === "FIXED_PRICE") {
    const fixedPrice = Math.max(0, Number(discount.value));

    // Không cho Modified Price cao hơn Original Price
    return Math.min(originalPrice, fixedPrice);
  }

  if (discount.type === "DECREASE_FIXED") {
    return Math.max(0, originalPrice - Number(discount.value));
  }

  const percentage = Math.min(100, Math.max(0, Number(discount.value)));

  const discounted = originalPrice - (originalPrice * percentage) / 100;

  return Math.max(0, discounted);
}

export function getApplicableProducts(
  products: Product[],
  rule: CPRule,
): Product[] {
  if (rule.productCondition.type === "ALL") {
    return products;
  }

  // Chuẩn hoá y hệt extensions/vinhhv-app-embed/assets/custom-pricing.js —
  // lệch quy tắc ở đây là admin và storefront báo hai giá khác nhau.
  const tags = rule.productCondition.tags.map((tag) =>
    tag.trim().toLowerCase(),
  );

  if (!tags.length) {
    return [];
  }

  return products.filter((product) =>
    product.tags.some((tag) => tags.includes(tag.trim().toLowerCase())),
  );
}
