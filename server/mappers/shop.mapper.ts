import { Shop } from "server/models/Shop.js";

export interface ShopDTO {
  id: string;
  name: string;
  domain: string;
  email: string | null;
  ownerName: string | null;
  ownerFirstName: string | null;
  currencyCode: string;
  currencyChangedAt: string | null;
}

export function toShopDTO(shop: Shop): ShopDTO {
  const ownerFirstName = shop.ownerName?.trim().split(/\s+/)[0] || null;

  return {
    id: String(shop.id),
    name: shop.name,
    domain: shop.shop,
    email: shop.email,
    ownerName: shop.ownerName,
    ownerFirstName,
    currencyCode: shop.currencyCode,
    currencyChangedAt: shop.currencyChangedAt
      ? shop.currencyChangedAt.toISOString()
      : null,
  };
}
