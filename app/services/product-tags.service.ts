import { apiRequest } from "./api-client";

type ProductTagsResponse = {
  tags: string[];
};


let cachedTags: string[] | null = null;
let inflightRequest: Promise<string[]> | null = null;

export async function getProductTags(): Promise<string[]> {
  if (cachedTags) {
    return [...cachedTags];
  }

  if (!inflightRequest) {
    inflightRequest = apiRequest<ProductTagsResponse>("/api/product-tags")
      .then((response) => {
        cachedTags = response.tags ?? [];
        return cachedTags;
      })
      .finally(() => {
        inflightRequest = null;
      });
  }

  const tags = await inflightRequest;

  return [...tags];
}

/**
 * Tag merchant vừa tạo trong form chưa tồn tại trên Shopify (chỉ khi nào
 * có product gắn tag đó thì Shopify mới biết). Thêm vào cache để lần gõ
 * sau nó xuất hiện trong danh sách gợi ý.
 */
export function addProductTagToCache(tag: string) {
  if (!cachedTags || cachedTags.includes(tag)) {
    return;
  }

  cachedTags = [...cachedTags, tag];
}