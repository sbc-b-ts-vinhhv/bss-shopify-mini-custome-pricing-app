export type RuleStatus = "enabled" | "disabled";

export type DiscountType =
  "FIXED_PRICE" | "DECREASE_FIXED" | "DECREASE_PERCENTAGE";

export type ProductConditionType = "ALL" | "TAGS";

export interface ProductCondition {
  type: ProductConditionType;
  tags: string[];
}

export interface DiscountConfig {
  type: DiscountType;
  value: number;
}

export interface CPRule {
  id: string;
  name: string;
  status: RuleStatus;
  productCondition: ProductCondition;
  discount: DiscountConfig;
  createdAt: string;
  updatedAt: string;
}

export interface RuleFormValues {
  name: string;
  status: RuleStatus;
  productConditionType: ProductConditionType;
  tags: string[];
  discountType: DiscountType;
  discountValue: number | string;
}
