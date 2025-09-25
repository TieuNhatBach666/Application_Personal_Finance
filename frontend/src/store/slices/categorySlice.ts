import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, API_ENDPOINTS } from '../../config/api';
import { Category, CategoryForm, ApiResponse } from '../../types';

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.BASE
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh mục'
      );
    }
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'categories/fetchCategoriesByType',
  async (type: 'Income' | 'Expense', { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.BY_TYPE(type)
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh mục'
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: CategoryForm, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.BASE,
        categoryData
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tạo danh mục'
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: string; data: CategoryForm }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id),
        data
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể cập nhật danh mục'
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa danh mục'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Lấy danh sách categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Lấy categories theo loại
    builder
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByType.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        // Cập nhật items với categories mới, giữ lại những cái hiện có từ các loại khác
        const newCategories = action.payload;
        const existingCategories = state.items.filter(
          item => !newCategories.some(newCat => newCat.type === item.type)
        );
        state.items = [...existingCategories, ...newCategories];
      })
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Tạo category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cập nhật category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Xóa category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;