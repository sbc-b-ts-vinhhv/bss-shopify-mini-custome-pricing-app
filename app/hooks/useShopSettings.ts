import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchShop, updateSenderEmail } from "../store/slices/shopSlice";

export function useShopSettings() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.shop);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShop());
    }
  }, [dispatch, status]);

  return {
    shop: data,
    loading: status === "loading",
    error,
    saveSenderEmail: (senderEmail: string) =>
      dispatch(updateSenderEmail({ senderEmail })),
  };
}