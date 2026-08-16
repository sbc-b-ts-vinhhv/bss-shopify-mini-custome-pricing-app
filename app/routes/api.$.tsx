import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

/**
 * Proxy các request /api/* của browser sang backend Koa.
 *
 * Browser không gọi thẳng Koa được: app chạy trên tunnel https (public address
 * space) còn Koa ở http://localhost (loopback), Chrome chặn theo Private Network
 * Access. Đi qua route này thì request là same-origin, không dính CORS/PNA, và
 * shop domain lấy từ session thay vì tin header do client gửi lên.
 */
async function proxyToBackend(request: Request, splat: string | undefined) {
  const { session } = await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Response("BACKEND_URL is not configured", { status: 500 });
  }

  const { search } = new URL(request.url);
  const target = `${backendUrl}/api/${splat ?? ""}${search}`;

  const headers = new Headers({
    Accept: "application/json",
    "X-Shopify-Shop-Domain": session.shop,
  });

  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
  });

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const loader = ({ request, params }: LoaderFunctionArgs) =>
  proxyToBackend(request, params["*"]);

export const action = ({ request, params }: ActionFunctionArgs) =>
  proxyToBackend(request, params["*"]);
