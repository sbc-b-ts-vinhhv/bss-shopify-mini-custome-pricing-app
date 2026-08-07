 import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
} from "@shopify/polaris";

export default function TestPage() {
  return (
    <Page
      title="Pricing Rules"
      subtitle="Testing Shopify Polaris"
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Polaris is working 🎉
            </Text>

            <Text as="p">
              If you can see this page with Shopify styling,
              everything has been configured correctly.
            </Text>

            <Button variant="primary">
              Test Button
            </Button>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}