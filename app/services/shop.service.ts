import type { Shop } from "../types/shop";
import { apiRequest } from "./api-client";

type ShopResponse = {
  id: string;
  name: string;
  domain: string;
};

let cachedShop: Shop | null = null;

function toShopModel(shop: ShopResponse): Shop {
  return {
    id: shop.id,
    name: shop.name,
    domain: shop.domain,
  };
}

export async function getShop(
  shopDomain: string,
): Promise<Shop> {
  if (cachedShop) {
    return { ...cachedShop };
  }

  const shop = await apiRequest<ShopResponse>(
    "/api/shops/current",
    {
      headers: {
        "X-Shopify-Shop-Domain": shopDomain,
      },
    },
  );

  cachedShop = toShopModel(shop);

  return { ...cachedShop };
}
