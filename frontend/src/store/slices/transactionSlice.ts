import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionForm, ApiResponse, PaginationState, FilterState } from '../../types';
import { api } from '../../config/api';

interface TransactionState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: FilterState;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    transactionCount: number;
  };
}

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  filters: {},
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    transactionCount: 0,
  },
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: { page?: number; limit?: number; filters?: FilterState }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.filters?.startDate) queryParams.append('startDate', params.filters.startDate);
    if (params?.filters?.endDate) queryParams.append('endDate', params.filters.endDate);
    if (params?.filters?.categoryId) queryParams.append('categoryId', params.filters.categoryId);
    if (params?.filters?.type) queryParams.append('type', params.filters.type);
    if (params?.filters?.search) queryParams.append('search', params.filters.search);

    const response = await api.get<ApiResponse<{
      transactions: Transaction[];
      pagination: PaginationState;
      summary: TransactionState['summary'];
    }>>(`/transactions?${queryParams.toString()}`);
    
    return response.data.data!;
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: TransactionForm) => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transactionData);
    return response.data.data!;
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: string; data: Partial<TransactionForm> }) => {
    const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return response.data.data!;
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string) => {
    await api.delete(`/transactions/${id}`);
    return id;
  }
);

export const fetchTransactionSummary = createAsyncThunk(
  'transactions/fetchTransactionSummary',
  async (filters?: FilterState) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);

    const response = await api.get<ApiResponse<TransactionState['summary']>>(
      `/transactions/summary?${queryParams.toString()}`
    );
    
    return response.data.data!;
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        // Update summary
        if (action.payload.type === 'Income') {
          state.summary.totalIncome += action.payload.amount;
        } else {
          state.summary.totalExpense += action.payload.amount;
        }
        state.summary.netSavings = state.summary.totalIncome - state.summary.totalExpense;
        state.summary.transactionCount += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        const transaction = state.items.find(item => item.id === action.payload);
        if (transaction) {
          // Update summary
          if (transaction.type === 'Income') {
            state.summary.totalIncome -= transaction.amount;
          } else {
            state.summary.totalExpense -= transaction.amount;
          }
          state.summary.netSavings = state.summary.totalIncome - state.summary.totalExpense;
          state.summary.transactionCount -= 1;
        }
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      
      // Fetch summary
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters, setPagination } = transactionSlice.actions;
export default transactionSlice.reducer;