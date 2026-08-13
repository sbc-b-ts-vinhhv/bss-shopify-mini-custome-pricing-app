import type { Shop } from "../models/index.js";

export interface ShopDTO {
  id: string;
  name: string;
  domain: string;
  senderEmail: string | null;
}

export function toShopDTO(shop: Shop): ShopDTO {
  return {
    id: String(shop.id),
    name: shop.name,
    domain: shop.shop,
    senderEmail: shop.senderEmail,
  };
}
