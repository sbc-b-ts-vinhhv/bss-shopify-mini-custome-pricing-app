import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  duplicateRule,
  fetchRules,
  removeRule,
} from "../store/slices/ruleSlice";

export function useRules() {
  const dispatch = useAppDispatch();

  const { items, status, error } = useAppSelector((state) => state.rule);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRules());
    }
  }, [dispatch, status]);

  return {
    rules: items,

    loading: status === "idle" || status === "loading",

    error,

    refetch: () => dispatch(fetchRules()),

    duplicateRule: (id: string) => dispatch(duplicateRule(id)),

    deleteRule: (id: string) => dispatch(removeRule(id)),
  };
}
