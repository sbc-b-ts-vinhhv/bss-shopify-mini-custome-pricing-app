import type { Shop, ShopFormValues } from "../types/shop";
import { apiRequest } from "./api-client";

type ShopResponse = {
  id: string;
  name: string;
  domain: string;
  senderEmail: string | null;
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

export async function updateSenderEmail(values: ShopFormValues): Promise<Shop> {
  const shop = await apiRequest<ShopResponse>("/api/shops/1", {
    method: "PATCH",
    body: JSON.stringify({
      senderEmail: values.senderEmail.trim(),
    }),
  });

  cachedShop = toShopModel(shop);

  return { ...cachedShop };
}
