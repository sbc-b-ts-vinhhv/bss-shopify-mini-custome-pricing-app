import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./slices/shopSlice";
import ruleReducer from "./slices/ruleSlice";

export const store = configureStore({
  reducer: {
    shop: shopReducer,
    rule: ruleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;