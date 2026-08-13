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
    senderEmail: shop.senderEmail ?? "",
  };
}

export async function getShop(): Promise<Shop> {
  if (cachedShop) {
    return { ...cachedShop };
  }

  const shop = await apiRequest<ShopResponse>("/api/shops/1");
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
