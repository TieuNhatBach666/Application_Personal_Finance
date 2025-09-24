import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'reminder' | 'analysis';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  actionable: boolean;
  data?: any;
  timestamp: string;
  readAt?: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  warnings: number;
  suggestions: number;
  achievements: number;
  reminders: number;
  analysis: number;
}

export interface CreateNotificationData {
  type: 'warning' | 'suggestion' | 'achievement' | 'reminder' | 'analysis';
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  counts: NotificationCounts | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  counts: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: { type?: string; isRead?: boolean; limit?: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`http://localhost:5000/api/notifications?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotificationCounts = createAsyncThunk(
  'notifications/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notification counts');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData: CreateNotificationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create notification');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark all notifications as read');
      }

      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notification');
      }

      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateSmartNotifications = createAsyncThunk(
  'notifications/generateSmart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate smart notifications');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.counts = null;
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      // Update counts
      if (state.counts) {
        state.counts.total += 1;
        if (!action.payload.isRead) {
          state.counts.unread += 1;
          switch (action.payload.type) {
            case 'warning':
              state.counts.warnings += 1;
              break;
            case 'suggestion':
              state.counts.suggestions += 1;
              break;
            case 'achievement':
              state.counts.achievements += 1;
              break;
            case 'reminder':
              state.counts.reminders += 1;
              break;
            case 'analysis':
              state.counts.analysis += 1;
              break;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch notification counts
      .addCase(fetchNotificationCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationCounts.fulfilled, (state, action: PayloadAction<NotificationCounts>) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(fetchNotificationCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
        state.loading = false;
        state.notifications.unshift(action.payload);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          
          // Update counts
          if (state.counts && state.counts.unread > 0) {
            state.counts.unread -= 1;
            switch (notification.type) {
              case 'warning':
                if (state.counts.warnings > 0) state.counts.warnings -= 1;
                break;
              case 'suggestion':
                if (state.counts.suggestions > 0) state.counts.suggestions -= 1;
                break;
              case 'achievement':
                if (state.counts.achievements > 0) state.counts.achievements -= 1;
                break;
              case 'reminder':
                if (state.counts.reminders > 0) state.counts.reminders -= 1;
                break;
              case 'analysis':
                if (state.counts.analysis > 0) state.counts.analysis -= 1;
                break;
            }
          }
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        
        // Reset unread counts
        if (state.counts) {
          state.counts.unread = 0;
          state.counts.warnings = 0;
          state.counts.suggestions = 0;
          state.counts.achievements = 0;
          state.counts.reminders = 0;
          state.counts.analysis = 0;
        }
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
        const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          state.notifications.splice(notificationIndex, 1);
          
          // Update counts
          if (state.counts) {
            state.counts.total -= 1;
            if (!notification.isRead) {
              state.counts.unread -= 1;
              switch (notification.type) {
                case 'warning':
                  if (state.counts.warnings > 0) state.counts.warnings -= 1;
                  break;
                case 'suggestion':
                  if (state.counts.suggestions > 0) state.counts.suggestions -= 1;
                  break;
                case 'achievement':
                  if (state.counts.achievements > 0) state.counts.achievements -= 1;
                  break;
                case 'reminder':
                  if (state.counts.reminders > 0) state.counts.reminders -= 1;
                  break;
                case 'analysis':
                  if (state.counts.analysis > 0) state.counts.analysis -= 1;
                  break;
              }
            }
          }
        }
      })

      // Generate smart notifications
      .addCase(generateSmartNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSmartNotifications.fulfilled, (state) => {
        state.loading = false;
        // Notifications will be added via separate fetch
      })
      .addCase(generateSmartNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetNotifications, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
