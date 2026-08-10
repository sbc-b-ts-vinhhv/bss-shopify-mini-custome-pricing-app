export type DiscountType =
  | "FIXED_PRICE"
  | "DECREASE_FIXED"
  | "DECREASE_PERCENTAGE";

export type ProductConditionType =
  | "ALL"
  | "TAGS";

export interface CPRule {
  id: string;

  name: string;

  status: "enabled" | "disabled";

  productCondition: {
    type: ProductConditionType;
    tags: string[];
  };

  discount: {
    type: DiscountType;
    value: number;
  };

  createdAt: string;
  updatedAt: string;
}