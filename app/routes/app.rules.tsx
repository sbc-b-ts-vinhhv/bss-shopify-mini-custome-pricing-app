import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  IndexTable,
  InlineStack,
  Link,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";
import { EditIcon, DuplicateIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useRules } from "app/hooks/useRules";
import { CPRule } from "app/types/rule";
import { formatDate, getRuleDisplayData } from "app/utils/rule-display";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function RulesPage() {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { rules, loading, error, refetch, duplicateRule, deleteRule } =
    useRules();

  const [ruleToDeletes, setRuleToDelete] = useState<CPRule | null>(null);
  const [processingRuleId, setProcessingRuleId] = useState<string | null>(null);

  const handleDuplicate = () => {};

  const handleDelet = () => {};

  const normalizedPathname = pathname.replace(/\/$/, "");

  if (normalizedPathname !== "/app/rules") {
    return <Outlet />;
  }

  if (loading) {
    return (
      <Page
        title="Custom Pricing Rules"
        primaryAction={{
          content: "Add rule",
          onAction: () => navigate("/app/rules/new"),
        }}
      >
        <Box minHeight="70vh">
          <InlineStack align="center" blockAlign="center">
            <Spinner accessibilityLabel="Loading pricing rules" size="large" />
          </InlineStack>
        </Box>
      </Page>
    );
  }

  const rows = rules.map((rule, index) => {
    const { applyTo, discount } = getRuleDisplayData(rule);
    const isProcessing = processingRuleId === rule.id;

    return (
      <IndexTable.Row
        id={rule.id}
        key={rule.id}
        position={index}
        onClick={() => navigate(`/app/rules/${rule.id}`)}
      >
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {rule.name}
          </Text>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone={rule.status === "enabled" ? "success" : "critical"}>
            {rule.status === "enabled" ? "Enabled" : "Disabled"}
          </Badge>
        </IndexTable.Cell>

        <IndexTable.Cell>{rule.priority}</IndexTable.Cell>

        <IndexTable.Cell>{formatDate(rule.createdAt)}</IndexTable.Cell>

        <IndexTable.Cell>
          {rule.updatedAt ? formatDate(rule.updatedAt) : "--"}
        </IndexTable.Cell>

        {/* Action */}
        <IndexTable.Cell>
          <InlineStack gap="200" wrap={false}>
            <Button
              icon={EditIcon}
              variant="secondary"
              accessibilityLabel={`Edit ${rule.name}`}
              onClick={() => {
                navigate(`/app/rules/${rule.id}`);
              }}
            />

            <Button
              icon={DuplicateIcon}
              variant="secondary"
              accessibilityLabel={`Duplicate ${rule.name}`}
              onClick={() => {
                // TODO: duplicate rule
              }}
            />

            <Button
              icon={DeleteIcon}
              variant="secondary"
              tone="critical"
              disabled={processingRuleId !== null}
              accessibilityLabel={`Remove ${rule.name}`}
              onClick={() => {
                setRuleToDelete(rule);
              }}
            />
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page
      title="Custom Pricing Rules"
      primaryAction={{
        content: "Add rule",
        onAction: () => navigate("/app/rules/new"),
      }}
    >
      <BlockStack gap="400">
        {!loading && rules.length === 0 && (
          <Card>
            <EmptyState
              image="/images/empty-state.svg"
              heading="Create your first pricing rule"
              action={{
                content: "Create rule",
                url: "/app/rules/new",
              }}
            >
              <p>
                Set a fixed price or discount for all products or products with
                specific tags.
              </p>
            </EmptyState>
          </Card>
        )}

        {!loading && rules.length > 0 && (
          <Card padding={"0"}>
            <IndexTable
              resourceName={{
                singular: "pricing rule",
                plural: "pricing rules",
              }}
              itemCount={rules.length}
              selectable={false}
              headings={[
                { title: "Name" },
                { title: "Status" },
                { title: "Priority" },
                { title: "Created Date" },
                { title: "Updated Date" },
                { title: "Action" },
              ]}
            >
              {rows}
            </IndexTable>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
