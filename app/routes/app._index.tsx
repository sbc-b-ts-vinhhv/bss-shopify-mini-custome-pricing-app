import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import {
  Banner,
  BlockStack,
  Card,
  InlineGrid,
  Layout,
  Page,
  SkeletonBodyText,
  Text,
} from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { useShopSettings } from "../hooks/useShopSettings";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <BlockStack gap="100">
      <Text as="span" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <Text as="p" variant="bodyMd" fontWeight="medium">
        {value ?? "—"}
      </Text>
    </BlockStack>
  );
}

export default function Index() {
  // Shop lấy từ Redux (nạp ở layout /app), không fetch lại ở đây.
  const { shop, loading, error } = useShopSettings();

  return (
    <Page title="Custom Pricing">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Shop information
              </Text>

              {error ? (
                <Banner tone="critical">{error}</Banner>
              ) : loading || !shop ? (
                <SkeletonBodyText lines={3} />
              ) : (
                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                  <Field label="Store name" value={shop.name} />
                  <Field label="Owner" value={shop.ownerName} />
                  <Field label="First name" value={shop.ownerFirstName} />
                  <Field label="Email" value={shop.email} />
                  <Field label="Domain" value={shop.domain} />
                </InlineGrid>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
