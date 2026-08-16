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
  const shopId = useAppSelector((state) => state.shop.data?.id);
  const shopStatus = useAppSelector((state) => state.shop.status);
  const shopError = useAppSelector((state) => state.shop.error);

  // fetchRules đọc shopId từ store, mà shop được nạp bất đồng bộ ở layout /app.
  // Nếu dispatch trước khi shop về thì thunk reject ngay, status thành "failed"
  // và không bao giờ retry vì điều kiện dưới chỉ chạy khi "idle".
  useEffect(() => {
    if (shopId && status === "idle") {
      dispatch(fetchRules());
    }
  }, [dispatch, status, shopId]);

  const shopPending = shopStatus === "idle" || shopStatus === "loading";
  const rulesPending = status === "idle" || status === "loading";

  return {
    rules: items,

    loading: shopPending || (Boolean(shopId) && rulesPending),

    error: error ?? shopError,

    refetch: () => dispatch(fetchRules()),

    duplicateRule: (id: string) => dispatch(duplicateRule(id)),

    deleteRule: (id: string) => dispatch(removeRule(id)),
  };
}
