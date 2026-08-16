import type { Shop } from "../types/shop";
import { apiRequest } from "./api-client";

// Shop domain do proxy `app/routes/api.$.tsx` gắn từ session Shopify,
// client không cần (và không được) tự khai.
export async function getShop(): Promise<Shop> {
  return apiRequest<Shop>("/api/shops/current");
}