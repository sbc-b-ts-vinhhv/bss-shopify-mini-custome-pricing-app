import { configureStore } from "@reduxjs/toolkit";
import ruleReducer from "./slices/ruleSlice";
import shopReducer from "./slices/shopSlice";

export const store = configureStore({
  reducer: {
    rule: ruleReducer,
    shop: shopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;