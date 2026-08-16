import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Autocomplete,
  Avatar,
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  ChoiceList,
  ChoiceListProps,
  Collapsible,
  Icon,
  IndexTable,
  InlineStack,
  Link,
  Page,
  Select,
  Tag,
  Text,
  TextField,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { usePricingPreview } from "app/hooks/usePricingPreview";
import {
  CPRule,
  DiscountType,
  RuleFormValues,
  RuleStatus,
} from "app/types/rule";
import { calculateModifiedPrice } from "app/utils/pricing";
import {
  discountTypeOptions,
  productConditionOptions,
  statusBadgeTone,
  statusSelectValue,
} from "app/utils/rule-display";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./RuleForm.module.css";
import { useProductTags } from "app/hooks/useProductTags";
import { useProducts } from "app/hooks/useProducts";

type RuleFormMode = "create" | "edit";

type RuleFormProps = {
  mode: RuleFormMode;
  initialRule?: CPRule | null;
  onSubmit: (values: RuleFormValues) => Promise<void>;
};

function toFormValues(rule?: CPRule | null): RuleFormValues {
  return {
    name: rule?.name ?? "",
    status: rule?.status ?? "enabled",
    priority: rule?.priority ?? 0,
    productConditionType: rule?.productCondition.type ?? "ALL",
    tags: rule?.productCondition.tags ?? [],
    discountType: rule?.discount.type ?? "FIXED_PRICE",
    discountValue: rule?.discount.value ?? "",
  };
}

export function RuleForm({ mode, initialRule, onSubmit }: RuleFormProps) {
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const [values, setValues] = useState<RuleFormValues>(() =>
    toFormValues(initialRule),
  );
  const [tagDraft, setTagDraft] = useState("");
  const [showPricingDetails, setShowPricingDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    tags: shopTags,
    loading: tagsLoading,
    error: tagsError,
    registerTag,
  } = useProductTags();

  const { products, loading: productsLoading } = useProducts();

  useEffect(() => {
    setValues(toFormValues(initialRule));
    setTagDraft("");
  }, [initialRule]);

  const previewRule = useMemo<CPRule | null>(() => {
    if (!values.name.trim() && mode === "create" && values.tags.length === 0) {
      return {
        id: "preview-rule",
        name: "Preview",
        status: values.status,
        priority: Number(values.priority) || 0,
        productCondition: {
          type: values.productConditionType,
          tags: values.tags,
        },
        discount: {
          type: values.discountType,
          value: Number(values.discountValue) || 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: initialRule?.id ?? "preview-rule",
      name: values.name || initialRule?.name || "Preview",
      status: values.status,
      priority: Number(values.priority) || 0,
      productCondition: {
        type: values.productConditionType,
        tags: values.tags,
      },
      discount: {
        type: values.discountType,
        value: Number(values.discountValue) || 0,
      },
      createdAt: initialRule?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [initialRule, mode, values]);

  const previewRows = usePricingPreview(previewRule, products);

  const submitValues = async () => {
    setSubmitting(true);

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        tags: values.tags.filter(Boolean),
        priority: Number(values.priority) || 0,
        discountValue: values.discountValue,
      });

      shopify.toast.show(
        mode === "create" ? "Pricing rule created" : "Pricing rule updated",
      );
      navigate("/app/rules");
    } catch (error) {
      shopify.toast.show(
        error instanceof Error ? error.message : "Unable to save pricing rule",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = (candidate: string) => {
    const nextTag = candidate.trim();
    if (!nextTag) return;

    registerTag(nextTag);

    setValues((current) => ({
      ...current,
      productConditionType: "TAGS",
      tags: current.tags.includes(nextTag)
        ? current.tags
        : [...current.tags, nextTag],
    }));
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setValues((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  };

  const tagQuery = tagDraft.trim();

  const tagOptions = useMemo(() => {
    const normalized = tagQuery.toLowerCase();

    return shopTags
      .filter((tag) => !values.tags.includes(tag))
      .filter((tag) => !normalized || tag.toLowerCase().includes(normalized))
      .slice(0, 20)
      .map((tag) => ({ value: tag, label: tag }));
  }, [shopTags, tagQuery, values.tags]);

  const canCreateTag =
    tagQuery.length > 0 &&
    !shopTags.some((tag) => tag.toLowerCase() === tagQuery.toLowerCase()) &&
    !values.tags.some((tag) => tag.toLowerCase() === tagQuery.toLowerCase());

  const handleTagSelect = (selected: string[]) => {
    const picked = selected[0];
    if (picked) addTag(picked);
  };

  const previewRowsMarkup = previewRows.map(
    ({ product, originalPrice, modifiedPrice }, index) => (
      <IndexTable.Row id={product.id} key={product.id} position={index}>
        <IndexTable.Cell>
          <Link url={`#${product.id}`} removeUnderline>
            {product.id}
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Avatar name={product.title} size="sm" source={product.image} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {product.title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" tone="subdued">
            {originalPrice.toFixed(2)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={modifiedPrice < originalPrice ? "success" : "info"}>
            {modifiedPrice.toFixed(2)}
          </Badge>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const pricingRows = previewRows.length ? previewRowsMarkup : null;

  const pricePreview = previewRule
    ? calculateModifiedPrice(100, previewRule)
    : 100;

  return (
    <Page
      title={
        mode === "edit" && initialRule
          ? `Edit custom pricing rule "${initialRule.name}"`
          : "Add custom pricing rule"
      }
      backAction={{ content: "Back", onAction: () => navigate("/app/rules") }}
      primaryAction={{
        content: mode === "create" ? "Save rule" : "Update rule",
        onAction: submitValues,
        loading: submitting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: () => navigate("/app/rules"),
        },
      ]}
    >
      <Box paddingBlockEnd={"800"}>
        <BlockStack gap="500">
          <Card padding="0">
            <div className={styles.formShell}>
              <div className={styles.sectionLabel}>
                <Text as="h2" variant="headingMd">
                  General information
                </Text>
              </div>
              <div className={styles.sectionBody}>
                <Card>
                  <BlockStack gap="400">
                    <TextField
                      label="Name"
                      value={values.name}
                      onChange={(name) =>
                        setValues((current) => ({ ...current, name }))
                      }
                      autoComplete="off"
                    />

                    <TextField
                      label="Priority"
                      value={String(values.priority)}
                      onChange={(priority) =>
                        setValues((current) => ({ ...current, priority }))
                      }
                      type="number"
                      min={0}
                      autoComplete="off"
                      helpText="Higher priority rules are applied first when several rules match."
                    />

                    <Select
                      label="Status"
                      options={[
                        { label: "Enabled", value: "enabled" },
                        { label: "Disabled", value: "disabled" },
                      ]}
                      value={statusSelectValue(values.status)}
                      onChange={(status) =>
                        setValues((current) => ({
                          ...current,
                          status: status as RuleStatus,
                        }))
                      }
                    />
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">
                        Current status
                      </Text>
                      <Badge tone={statusBadgeTone(values.status)}>
                        {values.status === "enabled" ? "Enabled" : "Disabled"}
                      </Badge>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>

              <div className={styles.sectionLabel}>
                <Text as="h2" variant="headingMd">
                  Apply to products
                </Text>
              </div>
              <div className={styles.sectionBody}>
                <Card>
                  <BlockStack gap="400">
                    <ChoiceList
                      title=""
                      choices={productConditionOptions}
                      selected={[values.productConditionType]}
                      onChange={(selected) =>
                        setValues((current) => ({
                          ...current,
                          productConditionType: selected[0] as "ALL" | "TAGS",
                        }))
                      }
                    />

                    <Collapsible
                      id="product-tags-collapsible"
                      open={values.productConditionType === "TAGS"}
                    >
                      <BlockStack gap="300">
                        <Autocomplete
                          options={tagOptions}
                          selected={[]}
                          loading={tagsLoading}
                          onSelect={handleTagSelect}
                          actionBefore={
                            canCreateTag
                              ? {
                                  content: `Create tag "${tagQuery}"`,
                                  onAction: () => addTag(tagQuery),
                                }
                              : undefined
                          }
                          emptyState={
                            <Box padding="300">
                              <Text as="p" tone="subdued" alignment="center">
                                No matching tag. Type a name to create a new
                                one.
                              </Text>
                            </Box>
                          }
                          textField={
                            <Autocomplete.TextField
                              label="Product tags"
                              value={tagDraft}
                              onChange={setTagDraft}
                              prefix={<Icon source={SearchIcon} tone="base" />}
                              placeholder="Search or create a tag"
                              autoComplete="off"
                              error={tagsError ?? undefined}
                            />
                          }
                        />
                        <InlineStack gap="200">
                          {values.tags.map((tag) => (
                            <Tag key={tag} onRemove={() => removeTag(tag)}>
                              {tag}
                            </Tag>
                          ))}
                        </InlineStack>
                      </BlockStack>
                    </Collapsible>
                  </BlockStack>
                </Card>
              </div>

              <div className={styles.sectionLabel}>
                <Text as="h2" variant="headingMd">
                  Choose B2B discount type
                </Text>
              </div>
              <div className={styles.sectionBody}>
                <Card>
                  <BlockStack gap="400">
                    <ChoiceList
                      title=""
                      choices={discountTypeOptions}
                      selected={[values.discountType]}
                      onChange={(selected) =>
                        setValues((current) => ({
                          ...current,
                          discountType: selected[0] as DiscountType,
                        }))
                      }
                    />
                    <TextField
                      label="Amount"
                      value={String(values.discountValue)}
                      onChange={(discountValue) =>
                        setValues((current) => ({
                          ...current,
                          discountValue,
                        }))
                      }
                      inputMode="decimal"
                      autoComplete="off"
                      helpText="The price will be adjusted based on your Shopify Markets setting."
                    />
                    <Text as="p" variant="bodySm" tone="subdued">
                      Preview price at $100: ${pricePreview.toFixed(2)}
                    </Text>
                  </BlockStack>
                </Card>
              </div>

              <div className={styles.sectionLabel}>
                <Text as="h2" variant="headingMd">
                  Apply a price to selected products/variants for all customers
                </Text>
              </div>
              <div className={styles.sectionBody}>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Review how the rule affects your products before saving.
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={() => setShowPricingDetails((value) => !value)}
                      >
                        {showPricingDetails
                          ? "Hide product pricing details"
                          : "Show product pricing details"}
                      </Button>
                    </InlineStack>

                    <Collapsible
                      id="pricing-details-collapsible"
                      open={showPricingDetails}
                    >
                      <Card padding="0">
                        <IndexTable
                          resourceName={{
                            singular: "product",
                            plural: "products",
                          }}
                          itemCount={previewRows.length}
                          loading={productsLoading}
                          selectable={false}
                          headings={[
                            { title: "ID" },
                            { title: "Image" },
                            { title: "Title" },
                            { title: "Original Price" },
                            { title: "Modified Price" },
                          ]}
                        >
                          {pricingRows}
                        </IndexTable>
                      </Card>
                    </Collapsible>
                  </BlockStack>
                </Card>
              </div>
            </div>
          </Card>

          <InlineStack align="end" gap="200">
            <Button onClick={() => navigate("/app/rules")}>Cancel</Button>

            <Button
              variant="primary"
              onClick={submitValues}
              loading={submitting}
            >
              {mode === "create" ? "Save rule" : "Update rule"}
            </Button>
          </InlineStack>
        </BlockStack>
      </Box>
    </Page>
  );
}
