import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CPRule } from "app/types/rule";

interface RuleState {
  rules: CPRule[];
}

const initialState: RuleState = {
  rules: [],
};

const ruleSlice = createSlice({
  name: "rule",
  initialState,
  reducers: {
    createRule: (
      state,
      action: PayloadAction<CPRule>
    ) => {
      state.rules.push(action.payload);
    },

    updateRule: (
      state,
      action: PayloadAction<CPRule>
    ) => {
      const index = state.rules.findIndex(
        (rule) => rule.id === action.payload.id
      );

      if (index !== -1) {
        state.rules[index] = action.payload;
      }
    },

    removeRule: (
      state,
      action: PayloadAction<string>
    ) => {
      state.rules = state.rules.filter(
        (rule) => rule.id !== action.payload
      );
    },

    duplicateRule: (
      state,
      action: PayloadAction<string>
    ) => {
      const rule = state.rules.find(
        (rule) => rule.id === action.payload
      );

      if (!rule) return;

      state.rules.push({
        ...rule,
        id: crypto.randomUUID(),
        name: `${rule.name} Copy`,
      });
    },
  },
});

export const {
  createRule,
  updateRule,
  removeRule,
  duplicateRule,
} = ruleSlice.actions;

export default ruleSlice.reducer;