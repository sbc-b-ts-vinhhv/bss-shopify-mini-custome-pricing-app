import type { CPRule } from "../types/rule";
import type { Product } from "../types/product";
import type { Shop } from "../types/shop";

export const mockProducts: Product[] = [
  {
    id: "prod_1",
    title: "Classic T-Shirt",
    price: 25,
    tags: ["clothing", "summer"],
    image: "https://picsum.photos/seed/tshirt/300/300",
  },
  {
    id: "prod_2",
    title: "Premium Hoodie",
    price: 60,
    tags: ["clothing", "premium"],
    image: "https://picsum.photos/seed/hoodie/300/300",
  },
  {
    id: "prod_3",
    title: "Running Shoes",
    price: 120,
    tags: ["shoes", "sport"],
    image: "https://picsum.photos/seed/shoes/300/300",
  },
  {
    id: "prod_4",
    title: "Leather Backpack",
    price: 90,
    tags: ["bag", "premium"],
    image: "https://picsum.photos/seed/backpack/300/300",
  },
  {
    id: "prod_5",
    title: "Baseball Cap",
    price: 20,
    tags: ["accessories", "summer"],
    image: "https://picsum.photos/seed/cap/300/300",
  },
];

export const mockRules: CPRule[] = [
  {
    id: "rule_1",
    name: "Summer Sale",
    status: "enabled",
    productCondition: {
      type: "TAGS",
      tags: ["summer"],
    },
    discount: {
      type: "DECREASE_PERCENTAGE",
      value: 15,
    },
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-05T12:00:00.000Z",
  },
  {
    id: "rule_2",
    name: "Premium Items Fixed Price",
    status: "disabled",
    productCondition: {
      type: "TAGS",
      tags: ["premium"],
    },
    discount: {
      type: "FIXED_PRICE",
      value: 49,
    },
    createdAt: "2026-08-02T10:00:00.000Z",
    updatedAt: "2026-08-06T12:00:00.000Z",
  },
];

export const mockShop: Shop = {
  id: "shop_1",
  name: "Vinh HV Store",
  domain: "vinh-hv.myshopify.com",
  senderEmail: "no-reply@vinhhv.com",
};