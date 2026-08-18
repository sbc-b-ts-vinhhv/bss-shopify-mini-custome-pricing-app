import type { Shop } from "../types/shop";
import { apiRequest } from "./api-client";

export async function getShop(): Promise<Shop> {
  return apiRequest<Shop>("/api/shops/current");
}

export async function acknowledgeCurrencyChange(): Promise<Shop> {
  return apiRequest<Shop>("/api/shops/current/acknowledge-currency-change", {
    method: "POST",
  });
}
