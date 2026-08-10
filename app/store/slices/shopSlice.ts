import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Shop, ShopFormValues } from "../../types/shop";
import {
  getShop,
  updateSenderEmail as updateSenderEmailService,
} from "../../services/shop.service";

interface ShopState {
  data: Shop | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ShopState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchShop = createAsyncThunk("shop/fetchShop", async () => {
  return await getShop();
});

export const updateSenderEmail = createAsyncThunk(
  "shop/updateSenderEmail",
  async (values: ShopFormValues) => {
    return await updateSenderEmailService(values);
  },
);

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShop.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchShop.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchShop.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load shop";
      })
      .addCase(updateSenderEmail.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default shopSlice.reducer;
