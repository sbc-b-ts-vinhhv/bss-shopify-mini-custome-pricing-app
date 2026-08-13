import { Shop } from "../models/index.js";

export interface CreateShopInput {
  shopifyShopId: string;
  shopifyDomain: string;
  name: string;
  email?: string;
  firstName?: string;
  currency?: string;
}

export interface UpdateShopInput {
  name?: string;
  email?: string;
  firstName?: string;
  currency?: string;
}

export async function createShop(data: CreateShopInput) {
  const shop = await Shop.create(data);

  return shop;
}

export async function getShopById(id: number) {
  const shop = await Shop.findByPk(id);

  return shop;
}

export async function updateShop(
  id: number,
  data: UpdateShopInput,
) {
  const shop = await Shop.findByPk(id);

  if (!shop) {
    return null;
  }

  await shop.update(data);

  return shop;
}