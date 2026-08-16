import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

const PRODUCTS_QUERY = `#graphql
  query ShopProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        tags
        featuredMedia {
          preview {
            image {
              url
            }
          }
        }
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

type ProductNode = {
  id: string;
  title: string;
  tags: string[];
  featuredMedia: { preview: { image: { url: string } | null } | null } | null;
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
};

type ProductsQueryResult = {
  data?: {
    products?: { nodes: ProductNode[] };
  };
};

/** "gid://shopify/Product/123" → "123" */
function parseGid(gid: string): string {
  const parts = gid.split("/");

  return parts[parts.length - 1] || gid;
}

/** Trả về đúng shape `app/types/product.ts` → frontend không phải sửa type. */
function toProduct(node: ProductNode) {
  const image = node.featuredMedia?.preview?.image?.url;

  return {
    id: parseGid(node.id),
    title: node.title,
    tags: node.tags,
    price: Number(node.priceRangeV2.minVariantPrice.amount),
    ...(image ? { image } : {}),
  };
}

/**
 * GET /api/products
 *
 * Read-only data cho Product Pricing Details. Không đi qua Koa vì không có
 * gì phải lưu xuống DB và session ở đây đã có sẵn access token.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: { first: 250 },
  });

  const payload = (await response.json()) as ProductsQueryResult;
  const nodes = payload.data?.products?.nodes ?? [];

  return Response.json({ success: true, data: nodes.map(toProduct) });
};
