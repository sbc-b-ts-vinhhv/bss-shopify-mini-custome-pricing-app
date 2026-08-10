import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCurrentRule, fetchRuleById } from "../store/slices/ruleSlice";

export function useRule(id?: string) {
  const dispatch = useAppDispatch();
  const currentRule = useAppSelector((state) => state.rule.currentRule);

  useEffect(() => {
    if (id) {
      dispatch(fetchRuleById(id));
    }

    return () => {
      dispatch(clearCurrentRule());
    };
  }, [dispatch, id]);

  return {
    rule: currentRule,
  };
}