import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockShop } from "app/mocks/mock-data";

const initialState = {
  shopData: mockShop,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    updateSenderEmail: (
      state,
      action: PayloadAction<string>
    ) => {
      state.shopData.senderEmail = action.payload;
    },
  },
});

export const { updateSenderEmail } = shopSlice.actions;

export default shopSlice.reducer;