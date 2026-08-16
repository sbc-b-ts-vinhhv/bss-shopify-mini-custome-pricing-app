import type { Product } from "../types/product";
import { apiRequest } from "./api-client";

export async function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>("/api/products");
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();

  return products.find((item) => item.id === id);
}
