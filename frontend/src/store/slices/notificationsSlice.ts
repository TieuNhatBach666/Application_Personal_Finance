import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'budget_warning' | 'achievement' | 'report' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
  timeAgo: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: string;
  priority?: string;
  actionUrl?: string;
  expiresAt?: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  filters: NotificationFilters;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  filters: {
    limit: 20,
    offset: 0,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (filters: NotificationFilters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
      
      const response = await fetch(`http://localhost:5000/api/notifications?${queryParams}`, {
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
      return { notifications: data.data, filters };
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
        method: 'PUT',
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
        method: 'PUT',
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

export const archiveNotification = createAsyncThunk(
  'notifications/archiveNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive notification');
      }

      return notificationId;
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

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get unread count');
      }

      const data = await response.json();
      return data.data.count;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.hasMore = true;
      state.filters = { limit: 20, offset: 0 };
      state.error = null;
    },
    updateFilters: (state, action: PayloadAction<NotificationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      if (action.payload.offset === 0) {
        state.items = [];
        state.hasMore = true;
      }
    },
    markAsReadLocal: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
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
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { notifications, filters } = action.payload;
        
        if (filters.offset === 0) {
          // Reset list for new search/filter
          state.items = notifications;
        } else {
          // Append for pagination
          state.items = [...state.items, ...notifications];
        }
        
        state.hasMore = notifications.length === (filters.limit || 20);
        state.filters = { ...state.filters, ...filters };
        
        // Update unread count
        state.unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.items.find(item => item.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })

      // Archive notification
      .addCase(archiveNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        state.items = state.items.filter(item => item.id !== notificationId);
        const notification = state.items.find(item => item.id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.items.find(item => item.id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter(item => item.id !== notificationId);
      })

      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        const newNotification = action.payload;
        state.items.unshift(newNotification);
        if (!newNotification.isRead) {
          state.unreadCount += 1;
        }
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { 
  clearError, 
  resetNotifications, 
  updateFilters, 
  markAsReadLocal, 
  addNotification 
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
