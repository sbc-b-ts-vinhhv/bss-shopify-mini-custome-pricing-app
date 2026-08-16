import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

const PRODUCT_TAGS_QUERY = `#graphql
  query ShopProductTags($first: Int!) {
    productTags(first: $first) {
      edges {
        node
      }
    }
  }
`;

type ProductTagsQueryResult = {
  data?: {
    productTags?: {
      edges: { node: string }[];
    };
  };
};

/**
 * GET /api/product-tags
 *
 * Trả về toàn bộ product tag của shop (tối đa 250 — giới hạn 1 page của
 * Admin API). Query `productTags` không hỗ trợ search phía server, nên
 * frontend fetch 1 lần rồi tự filter khi merchant gõ.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(PRODUCT_TAGS_QUERY, {
    variables: { first: 250 },
  });

  const payload = (await response.json()) as ProductTagsQueryResult;
  const tags = payload.data?.productTags?.edges.map((edge) => edge.node) ?? [];

  return Response.json({ success: true, data: { tags } });
};