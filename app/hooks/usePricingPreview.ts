import { useMemo } from "react";
import type { CPRule } from "../types/rule";
import type { Product } from "../types/product";
import { calculateModifiedPrice, getApplicableProducts } from "../utils/pricing";

export function usePricingPreview(rule: CPRule | null, products: Product[]) {
  return useMemo(() => {
    if (!rule) {
      return [];
    }

    const applicableProducts = getApplicableProducts(products, rule);

    return applicableProducts.map((product) => ({
      product,
      originalPrice: product.price,
      modifiedPrice: calculateModifiedPrice(product.price, rule),
    }));
  }, [rule, products]);
}