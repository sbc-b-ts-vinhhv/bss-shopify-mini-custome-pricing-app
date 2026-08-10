import { mockShop } from "../mocks/mock-data";
import type { Shop, ShopFormValues } from "../types/shop";
import { delay } from "./delay";

let shopStore: Shop = { ...mockShop };

export async function getShop(): Promise<Shop> {
  return delay({ ...shopStore });
}

export async function updateSenderEmail(values: ShopFormValues): Promise<Shop> {
  shopStore = {
    ...shopStore,
    senderEmail: values.senderEmail.trim(),
  };

  return delay({ ...shopStore });
}