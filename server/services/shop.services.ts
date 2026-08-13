import { Shop } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export interface CreateShopInput {
  shop: string;
  token: string;
  name: string;
  email?: string;
  senderEmail?: string;
}

export interface UpdateShopInput {
  name?: string;
  email?: string;
  senderEmail?: string;
}

export async function createShop(data: CreateShopInput) {
  const existing = await Shop.findOne({ where: { shop: data.shop } });

  if (existing) {
    throw AppError.conflict("Shop already exists");
  }

  return Shop.create(data);
}

export async function getShopById(id: number) {
  const shop = await Shop.findByPk(id);

  if (!shop) {
    throw AppError.notFound("Shop not found");
  }

  return shop;
}

export async function updateShop(id: number, data: UpdateShopInput) {
  const shop = await Shop.findByPk(id);

  if (!shop) {
    throw AppError.notFound("Shop not found");
  }

  await shop.update(data);

  return shop;
}
