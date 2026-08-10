import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CPRule, RuleFormValues } from "../../types/rule";
import {
  createRule as createRuleService,
  deleteRule as deleteRuleService,
  duplicateRule as duplicateRuleService,
  getRuleById,
  getRules,
  updateRule as updateRuleService,
} from "../../services/rules.service";

interface RuleState {
  items: CPRule[];
  currentRule: CPRule | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: RuleState = {
  items: [],
  currentRule: null,
  status: "idle",
  error: null,
};

export const fetchRules = createAsyncThunk("rule/fetchRules", async () => {
  return await getRules();
});

export const fetchRuleById = createAsyncThunk(
  "rule/fetchRuleById",
  async (id: string) => {
    return await getRuleById(id);
  },
);

export const createRule = createAsyncThunk(
  "rule/createRule",
  async (values: RuleFormValues) => {
    return await createRuleService(values);
  },
);

export const updateRule = createAsyncThunk(
  "rule/updateRule",
  async ({ id, values }: { id: string; values: RuleFormValues }) => {
    return await updateRuleService(id, values);
  },
);

export const removeRule = createAsyncThunk(
  "rule/removeRule",
  async (id: string) => {
    return await deleteRuleService(id);
  },
);

export const duplicateRule = createAsyncThunk(
  "rule/duplicateRule",
  async (id: string) => {
    return await duplicateRuleService(id);
  },
);

const ruleSlice = createSlice({
  name: "rule",
  initialState,
  reducers: {
    clearCurrentRule(state) {
      state.currentRule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRules.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load rules";
      })
      .addCase(fetchRuleById.fulfilled, (state, action) => {
        state.currentRule = action.payload ?? null;
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateRule.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.currentRule?.id === action.payload.id) {
          state.currentRule = action.payload;
        }
      })
      .addCase(removeRule.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
        if (state.currentRule?.id === action.payload.id) {
          state.currentRule = null;
        }
      })
      .addCase(duplicateRule.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      });
  },
});

export const { clearCurrentRule } = ruleSlice.actions;
export default ruleSlice.reducer;
