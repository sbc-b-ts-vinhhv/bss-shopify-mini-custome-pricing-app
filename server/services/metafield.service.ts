import { Rule } from "../models/index.js";
import { shopifyGraphql } from "../config/shopify.js";
import { AppError } from "../utils/AppError.js";
import type { ProductConditionType, DiscountType } from "../models/Rule.js";
import { getShopByDomain } from "./shop.service.js";

// Namespace/key phải khớp với Liquid ở Task 6: app.metafields.custom_pricing.rules
export const METAFIELD_NAMESPACE = "custom_pricing";
export const METAFIELD_KEY = "rules";
const METAFIELD_TYPE = "json";

// Shopify chặn metafield value > 64KB. Chặn sớm ở đây để lỗi hiện ra rõ ràng
// trong log của mình, thay vì nằm lẫn trong userErrors.
const MAX_VALUE_BYTES = 64 * 1024;

const APP_INSTALLATION_QUERY = `#graphql
  query AppInstallationId {
    currentAppInstallation {
      id
    }
  }
`;

const METAFIELDS_SET_MUTATION = `#graphql
  mutation SetRulesMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface MetafieldRule {
  id: string;
  name: string;
  priority: number;
  endAt: string | null;
  productCondition: { type: ProductConditionType; tags: string[] };
  discount: { type: DiscountType; value: number };
}

export interface RulesPayload {
  updatedAt: string;
  rules: MetafieldRule[];
}

/**
 * App-data metafield thuộc sở hữu của app installation, nên ownerId phải là
 * gid://shopify/AppInstallation/... — không phải id của shop.
 */
export async function getAppInstallationId(
  shopDomain: string,
  accessToken: string,
): Promise<string> {
  const data = await shopifyGraphql<{
    currentAppInstallation: { id: string } | null;
  }>(shopDomain, accessToken, APP_INSTALLATION_QUERY);

  const id = data.currentAppInstallation?.id;

  if (!id) {
    throw new AppError(
      "Cannot resolve the app installation for this shop",
      502,
    );
  }

  return id;
}

/**
 * Chỉ  rule enable, sort priority giảm dần
 *
 * endAt vẫn giữ trong payload: metafield được theme cache, rule hết hạn giữa
 * hai lần sync thì phía storefront phải tự loại (Task 7).
 */
export async function buildRulesPayload(shopId: number): Promise<RulesPayload> {
  const rules = await Rule.findAll({
    where: { shopId, status: "enabled" },
    order: [
      ["priority", "DESC"],
      ["id", "ASC"],
    ],
  });

  return {
    updatedAt: new Date().toISOString(),
    rules: rules.map((rule) => ({
      id: String(rule.id),
      name: rule.name,
      priority: rule.priority,
      endAt: rule.endAt ? rule.endAt.toISOString() : null,
      productCondition: {
        type: rule.productConditionType,
        tags: rule.productConditionType === "TAGS" ? rule.productTags : [],
      },
      discount: {
        type: rule.discountType,
        value: Number(rule.discountValue),
      },
    })),
  };
}

export async function syncRulesToMetafield(shopDomain: string) {
  const shop = await getShopByDomain(shopDomain);

  if (shop.status === "uninstalled") {
    return { synced: false, reason: "uninstalled" as const, ruleCount: 0 };
  }

  const payload = await buildRulesPayload(shop.id);
  const value = JSON.stringify(payload);
  const bytes = Buffer.byteLength(value, "utf8");

  if (bytes > MAX_VALUE_BYTES) {
    throw new AppError(
      `Rules payload is too large for a metafield (${bytes} bytes, limit ${MAX_VALUE_BYTES})`,
      422,
    );
  }

  const ownerId = await getAppInstallationId(shop.shop, shop.token);

  const data = await shopifyGraphql<{
    metafieldsSet: {
      metafields: { id: string }[];
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(shop.shop, shop.token, METAFIELDS_SET_MUTATION, {
    metafields: [
      {
        ownerId,
        namespace: METAFIELD_NAMESPACE,
        key: METAFIELD_KEY,
        type: METAFIELD_TYPE,
        value,
      },
    ],
  });

  const { metafields, userErrors } = data.metafieldsSet;

  if (userErrors.length) {
    console.error("metafieldsSet userErrors:", userErrors);
    throw new AppError(userErrors[0].message, 502);
  }

  return {
    synced: true as const,
    ruleCount: payload.rules.length,
    bytes,
    metafieldId: metafields[0]?.id ?? null,
  };
}
