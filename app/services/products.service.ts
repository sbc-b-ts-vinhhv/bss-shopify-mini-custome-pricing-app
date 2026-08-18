import type { Product } from "../types/product";
import { apiRequest } from "./api-client";

export async function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>("/api/products");
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    return await apiRequest<Product>(`/api/products/${id}`);
  } catch {
    return undefined;
  }
}
