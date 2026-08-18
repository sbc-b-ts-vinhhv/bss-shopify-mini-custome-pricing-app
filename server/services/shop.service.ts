import { Shop } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

export interface CreateShopInput {
  shop: string;
  token: string;
  shopifyId: string;
  name: string;
  email?: string;
}

export interface UpdateShopInput {
  name?: string;
  email?: string;
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

export async function getShopByDomain(domain: string): Promise<Shop> {
  const shop = await Shop.findOne({
    where: {
      shop: domain,
    },
  });

  if (!shop) {
    throw AppError.notFound(`Shop not found: ${domain}`);
  }

  return shop;
}

export async function uninstallShop(shopDomain: string) {
  const shop = await Shop.findOne({
    where: {
      shop: shopDomain,
    },
  });

  if (!shop) {
    return null;
  }

  shop.status = "uninstalled";

  await shop.save();

  return shop;
}

export async function createOrReactivateShop(input: {
  shopifyId: string;
  shop: string;
  token: string;
  name: string;
  email: string | null;
  ownerName: string | null;
  currencyCode: string;
}) {
  const existingShop = await Shop.findOne({
    where: {
      shop: input.shop,
    },
  });

  if (!existingShop) {
    return Shop.create({
      shopifyId: input.shopifyId,
      shop: input.shop,
      token: input.token,
      name: input.name,
      email: input.email,
      ownerName: input.ownerName,
      currencyCode: input.currencyCode,
      status: "active",
    });
  }

  existingShop.shopifyId = input.shopifyId;
  existingShop.token = input.token;
  existingShop.name = input.name;
  existingShop.email = input.email;
  existingShop.ownerName = input.ownerName;
  existingShop.currencyCode = input.currencyCode;
  existingShop.status = "active";

  await existingShop.save();

  return existingShop;
}
