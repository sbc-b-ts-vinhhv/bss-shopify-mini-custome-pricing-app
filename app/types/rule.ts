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

export interface MetafieldSyncStatus {
  synced: boolean;
  reason?: string;
}

export interface CPRule {
  id: string;
  // shop_id
  name: string;
  status: RuleStatus;
  priority: number;

  productCondition: ProductCondition;
  discount: DiscountConfig;

  createdAt: string;
  updatedAt: string;

  // Có mặt sau create/update/duplicate — cho biết rule đã đồng bộ ra
  // storefront metafield chưa, vì save DB và sync Shopify là 2 bước tách rời.
  metafieldSync?: MetafieldSyncStatus;
}

export interface RuleFormValues {
  name: string;
  status: RuleStatus;
  priority: number | string;
  productConditionType: ProductConditionType;
  tags: string[];
  discountType: DiscountType;
  discountValue: number | string;
}
