/* eslint-disable jsx-a11y/click-events-have-key-events */
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
  Modal,
  Page,
  Spinner,
  Text,
  INDEX_TABLE_SELECT_ALL_ITEMS,
  useIndexResourceState,
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
  const selectableRules = rules.map((rule) => ({ id: rule.id }));

  const [ruleToDelete, setRuleToDelete] = useState<CPRule | null>(null);
  const [processingRuleId, setProcessingRuleId] = useState<string | null>(null);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(selectableRules);

  const handleDuplicate = () => {};

  const handleDelete = async () => {
    if (!ruleToDelete) return;
    setProcessingRuleId(ruleToDelete.id);

    try {
      await deleteRule(ruleToDelete.id).unwrap();
      shopify.toast.show(`Removed "${ruleToDelete.name}"`);
      setRuleToDelete(null);
    } catch (error) {
      shopify.toast.show("Could not remove rule", { isError: true });
    } finally {
      setProcessingRuleId(null);
    }
  };

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
    const isSelected = selectedResources.includes(rule.id);

    return (
      <IndexTable.Row
        id={rule.id}
        key={rule.id}
        position={index}
        selected={isSelected}
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
          <div onClick={(event) => event.stopPropagation()}>
            <InlineStack gap={"150"}>
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
                onClick={() => setRuleToDelete(rule)}
              />
            </InlineStack>
          </div>
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
              selectable
              selectedItemsCount={
                allResourcesSelected
                  ? INDEX_TABLE_SELECT_ALL_ITEMS
                  : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
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

      <Modal
        open={ruleToDelete !== null}
        onClose={() => setRuleToDelete(null)}
        title="Remove pricing rule?"
        primaryAction={{
          content: "Remove",
          destructive: true,
          loading: processingRuleId === ruleToDelete?.id,
          onAction: handleDelete,
        }}

        secondaryActions={[
          {
            content: "Cancel",
            disabled: processingRuleId !== null,
            onAction: () => setRuleToDelete(null),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to remove{" "}
            <Text as="span" fontWeight="semibold">
              {ruleToDelete?.name}
            </Text>
            ? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
