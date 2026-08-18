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
import { useProductTags } from "app/hooks/useProductTags";
import { useProducts } from "app/hooks/useProducts";
import styles from "./RuleForm.module.css";

type RuleFormMode = "create" | "edit";

type RuleFormProps = {
  mode: RuleFormMode;
  initialRule?: CPRule | null;
  onSubmit: (values: RuleFormValues) => Promise<void>;
};

type FormErrors = {
  name?: string;
  priority?: string;
  tags?: string;
  discountValue?: string;
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

  // Error
  const [errors, setErrors] = useState<FormErrors>({});
  const validateDiscountValue = (
    value: string | number,
    discountType: DiscountType = values.discountType,
  ) => {
    const rawValue = String(value).trim();

    if (!rawValue) {
      return "Amount is required";
    }

    const discountValue = Number(rawValue);

    if (!Number.isFinite(discountValue)) {
      return "Amount must be a valid number";
    }

    if (discountValue <= 0) {
      return "Amount must be greater than 0";
    }

    if (discountType === "DECREASE_PERCENTAGE" && discountValue > 100) {
      return "Percentage cannot exceed 100%";
    }

    return undefined;
  };

  // Validate từng field
  const validateField = (
    field: keyof RuleFormValues,
    value: string | number | string[],
  ) => {
    let error: string | undefined;

    switch (field) {
      case "name": {
        const name = String(value).trim();

        if (!name) {
          error = "Rule name is required";
        } else if (name.length < 3) {
          error = "Rule name must be at least 3 characters";
        } else if (name.length > 100) {
          error = "Rule name must not exceed 100 characters";
        }

        break;
      }

      case "priority": {
        const priority = Number(value);

        if (String(value).trim() === "") {
          error = "Priority is required";
        } else if (!Number.isInteger(priority)) {
          error = "Priority must be a whole number";
        } else if (priority < 0) {
          error = "Priority cannot be negative";
        }

        break;
      }

      case "tags": {
        const tags = value as string[];

        if (values.productConditionType === "TAGS" && tags.length === 0) {
          error = "Please add at least one product tag";
        }

        break;
      }

      case "discountValue": {
        if (typeof value === "string" || typeof value === "number") {
          error = validateDiscountValue(value, values.discountType);
        }

        break;
      }
    }

    setErrors((current) => ({
      ...current,
      [field]: error,
    }));

    return !error;
  };

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

  // Validate:
  const validateForm = () => {
    const nextErrors: FormErrors = {};

    const name = values.name.trim();

    if (!name) {
      nextErrors.name = "Rule name is required";
    } else if (name.length < 3) {
      nextErrors.name = "Rule name must be at least 3 characters";
    } else if (name.length > 100) {
      nextErrors.name = "Rule name must not exceed 100 characters";
    }

    const priority = Number(values.priority);

    if (String(values.priority).trim() === "") {
      nextErrors.priority = "Priority is required";
    } else if (!Number.isInteger(priority)) {
      nextErrors.priority = "Priority must be a whole number";
    } else if (priority < 0) {
      nextErrors.priority = "Priority cannot be negative";
    }

    if (values.productConditionType === "TAGS" && values.tags.length === 0) {
      nextErrors.tags = "Please add at least one product tag";
    }

    const discountError = validateDiscountValue(
      values.discountValue,
      values.discountType,
    );

    if (discountError) {
      nextErrors.discountValue = discountError;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submitValues = async () => {
    if (!validateForm()) {
      shopify.toast.show("Please fix the errors before saving");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        tags: values.tags.filter(Boolean),
        priority: Number(values.priority),
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

    setErrors((current) => ({
      ...current,
      tags: undefined,
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
        <BlockStack gap="200">
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
                      onChange={(name) => {
                        setValues((current) => ({
                          ...current,
                          name,
                        }));

                        validateField("name", name);
                      }}
                      error={errors.name}
                      autoComplete="off"
                    />

                    <TextField
                      label="Priority"
                      value={String(values.priority)}
                      onChange={(priority) => {
                        setValues((current) => ({
                          ...current,
                          priority,
                        }));

                        validateField("priority", priority);
                      }}
                      error={errors.priority}
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
                      onChange={(selected) => {
                        const productConditionType = selected[0] as
                          "ALL" | "TAGS";

                        setValues((current) => ({
                          ...current,
                          productConditionType,
                        }));

                        if (productConditionType === "ALL") {
                          setErrors((current) => ({
                            ...current,
                            tags: undefined,
                          }));
                        } else if (values.tags.length === 0) {
                          setErrors((current) => ({
                            ...current,
                            tags: "Please add at least one product tag",
                          }));
                        }
                      }}
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
                            <BlockStack gap="100">
                              <Autocomplete.TextField
                                label="Product tags"
                                value={tagDraft}
                                onChange={setTagDraft}
                                prefix={
                                  <Icon source={SearchIcon} tone="base" />
                                }
                                placeholder="Search or create a tag"
                                autoComplete="off"
                                error={Boolean(errors.tags || tagsError)}
                              />

                              {(errors.tags || tagsError) && (
                                <Text as="p" variant="bodySm" tone="critical">
                                  {errors.tags || tagsError}
                                </Text>
                              )}
                            </BlockStack>
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
                      onChange={(selected) => {
                        const discountType = selected[0] as DiscountType;

                        setValues((current) => ({
                          ...current,
                          discountType,
                        }));

                        const error = validateDiscountValue(
                          values.discountValue,
                          discountType,
                        );

                        setErrors((current) => ({
                          ...current,
                          discountValue: error,
                        }));
                      }}
                    />
                    <TextField
                      label="Amount"
                      value={String(values.discountValue)}
                      onChange={(discountValue) => {
                        setValues((current) => ({
                          ...current,
                          discountValue,
                        }));

                        const error = validateDiscountValue(
                          discountValue,
                          values.discountType,
                        );

                        setErrors((current) => ({
                          ...current,
                          discountValue: error,
                        }));
                      }}
                      error={errors.discountValue}
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
