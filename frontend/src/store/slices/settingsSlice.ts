import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface UserSettings {
  appearance: {
    theme: string;
    language: string;
    currency: string;
  };
  notifications: {
    notifications_push: boolean;
    notifications_email: boolean;
    notifications_budget: boolean;
    notifications_achievements: boolean;
    notifications_reports: boolean;
  };
  privacy: {
    show_profile: boolean;
    share_data: boolean;
    analytics: boolean;
  };
  backup: {
    auto_backup: boolean;
    backup_frequency: string;
  };
  general: {
    first_time_setup: boolean;
  };
}

export interface BackupHistory {
  id: string;
  type: 'manual' | 'automatic';
  size: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface BackupData {
  backupId: string;
  size: number;
  createdAt: string;
  downloadData: string;
}

export interface UpdateSettingData {
  category: string;
  key: string;
  value: any;
  type?: 'string' | 'boolean' | 'number' | 'json';
}

export interface UpdateMultipleSettingsData {
  category: string;
  settings: Record<string, { value: any; type?: string }>;
}

interface SettingsState {
  settings: Partial<UserSettings>;
  backupHistory: BackupHistory[];
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  backupHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (category?: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching settings...', { category });
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const url = category
        ? `http://localhost:5000/api/settings/${category}`
        : 'http://localhost:5000/api/settings';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Settings API Response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch settings');
      }

      const data = await response.json();
      console.log('✅ Settings fetched:', data);
      return { category, data: data.data };
    } catch (error: any) {
      console.error('❌ Settings fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateSetting = createAsyncThunk(
  'settings/updateSetting',
  async ({ category, key, value, type = 'string' }: UpdateSettingData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/settings/${category}/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update setting');
      }

      const data = await response.json();
      return { category, key, value, type };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMultipleSettings = createAsyncThunk(
  'settings/updateMultiple',
  async ({ category, settings }: UpdateMultipleSettingsData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/settings/${category}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      return { category, settings };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSetting = createAsyncThunk(
  'settings/deleteSetting',
  async ({ category, key }: { category: string; key: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/settings/${category}/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete setting');
      }

      return { category, key };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (category: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/settings/reset/${category}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset settings');
      }

      return category;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBackup = createAsyncThunk(
  'settings/createBackup',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create backup');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBackupHistory = createAsyncThunk(
  'settings/fetchBackupHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/backup/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Nếu là lỗi 400, có thể bảng chưa tồn tại, trả về mảng rỗng
        if (response.status === 400) {
          console.log('⚠️ Bảng BackupHistory chưa tồn tại, trả về mảng rỗng');
          return [];
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch backup history');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const setupBackupTable = createAsyncThunk(
  'settings/setupBackupTable',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/backup/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to setup backup table');
      }

      const data = await response.json();
      return data.message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSettings: (state) => {
      state.settings = {};
      state.backupHistory = [];
      state.error = null;
    },
    updateLocalSetting: (state, action: PayloadAction<{ category: string; key: string; value: any }>) => {
      const { category, key, value } = action.payload;
      if (!state.settings[category as keyof UserSettings]) {
        (state.settings as any)[category] = {};
      }
      (state.settings as any)[category][key] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        const { category, data } = action.payload;
        
        if (category) {
          // Update specific category
          (state.settings as any)[category] = data;
        } else {
          // Update all settings
          state.settings = data;
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update setting
      .addCase(updateSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.loading = false;
        const { category, key, value } = action.payload;
        
        if (!state.settings[category as keyof UserSettings]) {
          (state.settings as any)[category] = {};
        }
        (state.settings as any)[category][key] = value;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update multiple settings
      .addCase(updateMultipleSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMultipleSettings.fulfilled, (state, action) => {
        state.loading = false;
        const { category, settings } = action.payload;
        
        if (!state.settings[category as keyof UserSettings]) {
          (state.settings as any)[category] = {};
        }
        
        Object.entries(settings).forEach(([key, settingData]) => {
          (state.settings as any)[category][key] = settingData.value;
        });
      })
      .addCase(updateMultipleSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete setting
      .addCase(deleteSetting.fulfilled, (state, action) => {
        const { category, key } = action.payload;
        if (state.settings[category as keyof UserSettings]) {
          delete (state.settings as any)[category][key];
        }
      })

      // Reset settings
      .addCase(resetSettings.fulfilled, (state, action) => {
        const category = action.payload;
        // Will be refetched to get default values
        delete (state.settings as any)[category];
      })

      // Create backup
      .addCase(createBackup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBackup.fulfilled, (state, action: PayloadAction<BackupData>) => {
        state.loading = false;
        // Add to backup history
        const newBackup: BackupHistory = {
          id: action.payload.backupId,
          type: 'manual',
          size: action.payload.size,
          status: 'completed',
          createdAt: action.payload.createdAt,
        };
        state.backupHistory.unshift(newBackup);
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch backup history
      .addCase(fetchBackupHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBackupHistory.fulfilled, (state, action: PayloadAction<BackupHistory[]>) => {
        state.loading = false;
        state.backupHistory = action.payload;
      })
      .addCase(fetchBackupHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Setup backup table
      .addCase(setupBackupTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setupBackupTable.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setupBackupTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetSettings: resetSettingsLocal, updateLocalSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
