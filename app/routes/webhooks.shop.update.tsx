import type { ActionFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import { forwardWebhook } from "../webhooks.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Koa tự query lại Shopify để lấy email/name mới nhất.
  await forwardWebhook("shop-update", shop);

  return new Response();
};
