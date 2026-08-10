import { ShopData } from "app/types/shop";
import type { Product } from "../types/product";

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Classic T-Shirt",
    price: 25,
    tags: ["clothing", "summer"],
  },
  {
    id: "2",
    title: "Premium Hoodie",
    price: 60,
    tags: ["clothing", "premium"],
  },
  {
    id: "3",
    title: "Running Shoes",
    price: 120,
    tags: ["shoes", "sport"],
  },
  {
    id: "4",
    title: "Leather Backpack",
    price: 90,
    tags: ["bag", "premium"],
  },
  {
    id: "5",
    title: "Baseball Cap",
    price: 20,
    tags: ["accessories", "summer"],
  },
];

export const mockShop: ShopData = {
  id: "shop_001",
  name: "Vinh Fashion Store",
  email: "admin@vinhfashion.com",
  senderEmail: "support@vinhfashion.com",
};