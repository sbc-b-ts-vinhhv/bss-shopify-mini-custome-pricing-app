import { Banner, Box, InlineStack, Page, Spinner } from "@shopify/polaris";
import { useNavigate } from "react-router";

import { useAppDispatch } from "../store/hooks";
import { useShopSettings } from "../hooks/useShopSettings";
import { createRule } from "../store/slices/ruleSlice";
import type { RuleFormValues } from "../types/rule";
import { RuleForm } from "../components/RuleForm/RuleForm";

export default function NewRulePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { shop, loading, error } = useShopSettings();

  const handleSubmit = async (values: RuleFormValues) => {
    await dispatch(createRule(values)).unwrap();
  };

  // createRule lấy shopId từ store, nên chờ shop nạp xong mới cho nhập form.
  if (loading) {
    return (
      <Page
        title="Add custom pricing rule"
        backAction={{ content: "Back", onAction: () => navigate("/app/rules") }}
      >
        <Box minHeight="70vh">
          <InlineStack align="center" blockAlign="center">
            <Spinner accessibilityLabel="Loading shop" size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  if (!shop) {
    return (
      <Page
        title="Add custom pricing rule"
        backAction={{ content: "Back", onAction: () => navigate("/app/rules") }}
      >
        <Banner tone="critical" title="Unable to load shop">
          <p>{error ?? "Shop information is not available."}</p>
        </Banner>
      </Page>
    );
  }

  return <RuleForm mode="create" onSubmit={handleSubmit} />;
}
