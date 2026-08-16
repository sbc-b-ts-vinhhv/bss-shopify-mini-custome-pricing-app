import type { Shop } from "../models/index.js";

export interface ShopDTO {
  id: string;
  name: string;
  domain: string;
  email: string | null;
  ownerName: string | null;
  ownerFirstName: string | null;
}

/** `token` cố tình không có mặt ở đây — không bao giờ serialize ra API. */
export function toShopDTO(shop: Shop): ShopDTO {
  // Shopify chỉ trả họ tên đầy đủ ("John Smith"), first name là token đầu tiên.
  const ownerFirstName = shop.ownerName?.trim().split(/\s+/)[0] || null;

  return {
    id: String(shop.id),
    name: shop.name,
    domain: shop.shop,
    email: shop.email,
    ownerName: shop.ownerName,
    ownerFirstName,
  };
}
