import { useAppDispatch } from "../store/hooks";
import { createRule } from "../store/slices/ruleSlice";
import type { RuleFormValues } from "../types/rule";
import { RuleForm } from "../components/RuleForm/RuleForm";

export default function NewRulePage() {
  const dispatch = useAppDispatch();

  const handleSubmit = async (values: RuleFormValues) => {
    console.log("CREATE CLICK")
    await dispatch(createRule(values)).unwrap();
  };

  return <RuleForm mode="create" onSubmit={handleSubmit} />;
}
