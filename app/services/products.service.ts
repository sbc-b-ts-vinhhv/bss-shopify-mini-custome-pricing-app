import { mockProducts } from "../mocks/mock-data";
import type { Product } from "../types/product";
import { delay } from "./delay";

export async function getProducts(): Promise<Product[]> {
  return delay(mockProducts);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = mockProducts.find((item) => item.id === id);
  return delay(product);
}