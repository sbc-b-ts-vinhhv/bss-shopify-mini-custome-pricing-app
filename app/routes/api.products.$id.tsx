import type { LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

const PRODUCT_QUERY = `#graphql
  query ShopProduct($id: ID!) {
    product(id: $id) {
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

type ProductQueryResult = {
  data?: {
    product?: ProductNode | null;
  };
};

/** "123" hoặc "gid://shopify/Product/123" → "gid://shopify/Product/123" */
function toProductGid(id: string): string {
  return id.startsWith("gid://") ? id : `gid://shopify/Product/${id}`;
}

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
 * GET /api/products/:id
 *
 * Lấy đúng 1 product theo ID thay vì fetch 250 product rồi filter.
 */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const id = params.id;

  if (!id) {
    return Response.json(
      { success: false, error: { message: "Missing product id" } },
      { status: 400 },
    );
  }

  const response = await admin.graphql(PRODUCT_QUERY, {
    variables: { id: toProductGid(id) },
  });

  const payload = (await response.json()) as ProductQueryResult;
  const product = payload.data?.product;

  if (!product) {
    return Response.json(
      { success: false, error: { message: "Product not found" } },
      { status: 404 },
    );
  }

  return Response.json({ success: true, data: toProduct(product) });
};
