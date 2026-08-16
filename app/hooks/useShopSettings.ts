import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateSenderEmail } from "../store/slices/shopSlice";

// Shop được nạp một lần ở layout /app (app/routes/app.tsx),
// hook này chỉ đọc lại từ store.
export function useShopSettings() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.shop);

  return {
    shop: data,
    loading: status === "idle" || status === "loading",
    error,
    saveSenderEmail: (senderEmail: string) =>
      dispatch(updateSenderEmail({ senderEmail })),
  };
}
