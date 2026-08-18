import { shopifyGraphql } from "../config/shopify.js";
import { getShopByDomain } from "./shop.service.js";
import { AppError } from "../utils/AppError.js";

const SHOP_INFO_QUERY = `#graphql
  query ShopInfo {
    shop {
      id
      name
      email
      shopOwnerName
      myshopifyDomain
      currencyCode
      ianaTimezone
    }
  }
`;

export interface ShopifyShopInfo {
  id: string;
  name: string;
  email: string | null;
  shopOwnerName: string | null;
  myshopifyDomain: string;
  currencyCode: string;
  ianaTimezone: string;
}

/**
 * Gọi Shopify bằng token truyền thẳng vào.
 *
 * Dùng ở luồng install: lúc đó shop chưa chắc có row trong DB để đọc token ra.
 */
export async function fetchShopInfoWithToken(
  shopDomain: string,
  accessToken: string,
): Promise<ShopifyShopInfo> {
  const data = await shopifyGraphql<{ shop: ShopifyShopInfo }>(
    shopDomain,
    accessToken,
    SHOP_INFO_QUERY,
  );

  return data.shop;
}

/**
 * Gọi Shopify bằng token lấy từ DB.
 *
 * Chỉ dùng cho luồng KHÔNG có session merchant (webhook, job đẩy metafields).
 * Dữ liệu read-only phục vụ UI thì gọi thẳng từ resource route của app bằng
 * `authenticate.admin` cho ngắn — xem `app/routes/api.products.tsx`.
 */
export async function fetchShopInfo(
  shopDomain: string,
): Promise<ShopifyShopInfo> {
  const shop = await getShopByDomain(shopDomain);

  if (shop.status === "uninstalled") {
    throw new AppError("The app is no longer installed on this shop", 409);
  }

  return fetchShopInfoWithToken(shop.shop, shop.token);
}

/**
 * Đồng bộ thông tin shop từ Shopify về MySQL.
 * Bài 4 sẽ gọi lại hàm này từ webhook shop/update.
 */
export async function syncShopFromShopify(shopDomain: string) {
  const info = await fetchShopInfo(shopDomain);
  const shop = await getShopByDomain(shopDomain);

  shop.shopifyId = info.id;
  shop.name = info.name;
  shop.email = info.email;
  shop.ownerName = info.shopOwnerName;
  shop.currencyCode = info.currencyCode;

  await shop.save();

  return shop;
}
