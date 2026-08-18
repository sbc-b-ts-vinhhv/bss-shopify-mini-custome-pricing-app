import { useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateRule } from "../store/slices/ruleSlice";
import { useRule } from "../hooks/useRule";
import type { RuleFormValues } from "../types/rule";
import { RuleForm } from "../components/RuleForm/RuleForm";
import { BlockStack, Card, Page, Spinner, Text } from "@shopify/polaris";

export default function EditRulePage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { rule } = useRule(id);
  const items = useAppSelector((state) => state.rule.items);

  const loadedRule =
    rule?.id === id ? rule : (items.find((item) => item.id === id) ?? null);

  const handleSubmit = async (values: RuleFormValues) => {
    if (!id) throw new Error("Missing rule id");
    return dispatch(updateRule({ id, values })).unwrap();
  };

  if (!loadedRule && id) {
    return (
      <Page title="Edit custom pricing rule">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner accessibilityLabel="Loading rule" size="large" />
        </div>
      </Page>
    );
  }

  return <RuleForm mode="edit" initialRule={loadedRule} onSubmit={handleSubmit} />;
}
