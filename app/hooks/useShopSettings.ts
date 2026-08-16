import { useAppSelector } from "../store/hooks";

// Shop được nạp một lần ở layout /app (app/routes/app.tsx),
// hook này chỉ đọc lại từ store.
export function useShopSettings() {
  const { data, status, error } = useAppSelector((state) => state.shop);

  return {
    shop: data,
    loading: status === "idle" || status === "loading",
    error,
  };
}
