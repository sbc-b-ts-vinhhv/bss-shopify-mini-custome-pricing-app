import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

/**
 * Ghi shop (shopifyId, token, name, email) xuống MySQL ngay sau khi auth.
 *
 * Chạy đúng một lần mỗi lần cài / re-auth, thay vì mỗi lần merchant mở Home.
 */
async function installShop(session: { shop: string; accessToken?: string }) {
  // eslint-disable-next-line no-undef
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  if (!session.accessToken) {
    throw new Error("Session has no access token after auth");
  }

  const response = await fetch(`${backendUrl}/api/shops/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Shop-Domain": session.shop,
    },
    body: JSON.stringify({ token: session.accessToken }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to install shop ${session.shop} (${response.status}): ${await response.text()}`,
    );
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July26,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  hooks: {
    afterAuth: async ({ session }) => {
      await installShop(session);
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
