import "dotenv/config";

import { AppError } from "../utils/AppError.js";

export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2026-07";

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * Client GraphQL Admin API cho các luồng chạy phía server.
 *
 * accessToken chỉ đi từ DB → header của request này. Không log, không đưa
 * vào bất kỳ response nào.
 */
export async function shopifyGraphql<T>(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const endpoint = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new AppError(
      "Shopify rejected the access token. The shop may need to reinstall the app.",
      502,
    );
  }

  if (response.status === 429) {
    throw new AppError("Shopify API rate limit exceeded", 429);
  }

  if (!response.ok) {
    throw new AppError(`Shopify API error (status ${response.status})`, 502);
  }

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (payload.errors?.length) {
    // Chỉ log message Shopify trả về — không log token, không log header.
    console.error("Shopify GraphQL errors:", payload.errors);
    throw new AppError(payload.errors[0].message, 502);
  }

  if (!payload.data) {
    throw new AppError("Shopify returned an empty response", 502);
  }

  return payload.data;
}
