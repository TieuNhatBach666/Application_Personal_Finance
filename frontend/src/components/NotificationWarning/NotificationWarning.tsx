/**
 * NotificationWarning Component
 * Hiển thị cảnh báo từ notifications system thay vì logic tính toán trực tiếp
 * Tác giả: Tiểu Nhất Bạch
 */

import React from 'react';
import {
  Alert,
  Paper,
  Box,
  Typography,
  Chip,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Warning,
  Close,
  TrendingDown,
  AccountBalance
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { markAsRead } from '../../store/slices/notificationSlice';
import { useUserSettings } from '../../hooks/useUserSettings';

interface NotificationWarningProps {
  /** Loại cảnh báo cần hiển thị */
  type?: 'budget' | 'overspending' | 'all';
  /** Có hiển thị nút đóng không */
  dismissible?: boolean;
  /** Style variant */
  variant?: 'alert' | 'paper';
  /** Animation timeout */
  timeout?: number;
}

const NotificationWarning: React.FC<NotificationWarningProps> = ({
  type = 'all',
  dismissible = true,
  variant = 'paper',
  timeout = 1500
}) => {
  const dispatch = useDispatch();
  const { formatFull, getText } = useUserSettings();
  
  // Lấy notifications chưa đọc từ store
  const { notifications } = useSelector((state: RootState) => state.notifications);
  
  // Filter notifications theo type
  const warningNotifications = notifications.filter(notification => {
    if (!notification.isRead) {
      switch (type) {
        case 'budget':
          return notification.type === 'warning' &&
                 notification.title?.includes('ngân sách');
        case 'overspending':
          return notification.type === 'warning' &&
                 (notification.title?.includes('vượt thu nhập') ||
                  notification.title?.includes('chi tiêu'));
        case 'all':
        default:
          return notification.type === 'warning';
      }
    }
    return false;
  });

  // Nếu không có cảnh báo, không hiển thị gì
  if (warningNotifications.length === 0) {
    return null;
  }

  // Xử lý đóng cảnh báo
  const handleDismiss = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  // Render Alert variant
  if (variant === 'alert') {
    return (
      <>
        {warningNotifications.map((notification) => (
          <Fade key={notification.id} in timeout={timeout}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                '& .MuiAlert-icon': { fontSize: 28 }
              }}
              action={
                dismissible && (
                  <Tooltip title="Đánh dấu đã đọc">
                    <IconButton
                      size="small"
                      onClick={() => handleDismiss(notification.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {notification.title}
              </Typography>
              <Typography variant="body2">
                {notification.message}
              </Typography>
            </Alert>
          </Fade>
        ))}
      </>
    );
  }

  // Render Paper variant (default)
  return (
    <>
      {warningNotifications.map((notification) => (
        <Fade key={notification.id} in timeout={timeout}>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e74c3c15 0%, #c0392b05 100%)',
              border: '1px solid #e74c3c30',
              boxShadow: '0 8px 25px rgba(231, 76, 60, 0.15)',
              position: 'relative'
            }}
          >
            {/* Dismiss button */}
            {dismissible && (
              <Tooltip title="Đánh dấu đã đọc">
                <IconButton
                  size="small"
                  onClick={() => handleDismiss(notification.id)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: 'error.main'
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Warning header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Warning sx={{ color: 'error.main', fontSize: 32 }} />
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 700 }}>
                {notification.title}
              </Typography>
            </Box>

            {/* Warning message */}
            <Typography variant="body1" sx={{ color: 'text.primary', mb: 2 }}>
              {notification.message}
            </Typography>

            {/* Suggestions chips */}
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              💡 <strong>{getText('suggestions')}</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={getText('reduceExpenses')}
                size="small"
                sx={{
                  backgroundColor: (theme) => theme.palette.error.main + '20',
                  color: 'error.main'
                }}
              />
              <Chip
                label={getText('increaseIncome')}
                size="small"
                sx={{
                  backgroundColor: (theme) => theme.palette.success.main + '20',
                  color: 'success.main'
                }}
              />
              <Chip
                label={getText('reviewBudget')}
                size="small"
                sx={{
                  backgroundColor: (theme) => theme.palette.info.main + '20',
                  color: 'info.main'
                }}
              />
            </Box>
          </Paper>
        </Fade>
      ))}
    </>
  );
};

export default NotificationWarning;
