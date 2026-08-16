import type { ActionFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import db from "../db.server";
import { forwardWebhook } from "../webhooks.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook có thể bắn nhiều lần, kể cả sau khi app đã gỡ xong.
  // Lần trước chạy rồi thì session đã bị xoá.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Đổi shops.status = 'uninstalled' trong MySQL (Koa).
  await forwardWebhook("app-uninstalled", shop);

  // Luôn 200, kể cả khi Koa chết — nếu không Shopify sẽ retry rồi huỷ topic.
  return new Response();
};