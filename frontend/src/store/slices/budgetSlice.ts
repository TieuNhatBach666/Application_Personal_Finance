import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Budget {
  BudgetID: string;
  id?: string; // Fallback for compatibility
  CategoryID?: string;
  categoryId?: string; // Fallback for compatibility
  BudgetName: string;
  name?: string; // Fallback for compatibility
  BudgetAmount: number;
  totalAmount?: number; // Fallback for compatibility
  SpentAmount: number;
  spentAmount?: number; // Fallback for compatibility
  Period: 'daily' | 'monthly' | 'quarterly' | 'yearly';
  period?: 'weekly' | 'monthly' | 'yearly'; // Fallback for compatibility
  StartDate: string;
  startDate?: string; // Fallback for compatibility
  EndDate: string;
  endDate?: string; // Fallback for compatibility
  WarningThreshold: number;
  warningThreshold?: number; // Fallback for compatibility
  Color: string;
  color?: string; // Fallback for compatibility
  IsActive: boolean;
  isActive?: boolean; // Fallback for compatibility
  CreatedAt: string;
  createdAt?: string; // Fallback for compatibility
  UpdatedAt: string;
  updatedAt?: string; // Fallback for compatibility
  CategoryName?: string;
  categoryName?: string; // Fallback for compatibility
  CategoryIcon?: string;
  categoryIcon?: string; // Fallback for compatibility
}

export interface BudgetSummary {
  totalBudgets: number;
  totalBudgetAmount: number;
  totalSpentAmount: number;
  averageUsagePercentage: number;
  budgetsNearLimit: number;
}

export interface CreateBudgetData {
  name: string;
  categoryId?: string;
  totalAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  warningThreshold?: number;
  color?: string;
}

export interface UpdateBudgetData extends CreateBudgetData {
  id: string;
}

interface BudgetState {
  budgets: Budget[];
  summary: BudgetSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  summary: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch budgets');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/budgets/summary/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch budget summary');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData: CreateBudgetData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create budget');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, ...budgetData }: UpdateBudgetData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update budget');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (budgetId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete budget');
      }

      return budgetId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBudgetSpent = createAsyncThunk(
  'budgets/updateSpent',
  async ({ budgetId, spentAmount }: { budgetId: string; spentAmount: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/budgets/${budgetId}/spent`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spentAmount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update spent amount');
      }

      return { budgetId, spentAmount };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBudgets: (state) => {
      state.budgets = [];
      state.summary = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch budget summary
      .addCase(fetchBudgetSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action: PayloadAction<BudgetSummary>) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update spent amount
      .addCase(updateBudgetSpent.fulfilled, (state, action) => {
        const { budgetId, spentAmount } = action.payload;
        const budget = state.budgets.find(b => b.id === budgetId);
        if (budget) {
          budget.spentAmount = spentAmount;
        }
      });
  },
});

export const { clearError, resetBudgets } = budgetSlice.actions;
export default budgetSlice.reducer;
