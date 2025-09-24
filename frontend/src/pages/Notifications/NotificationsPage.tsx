import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  getUnreadCount,
  updateFilters
} from '../../store/slices/notificationsSlice';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fade,
  Slide,
  Grow,
  Tabs,
  Tab,
  Badge,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import {
  NotificationsActive,
  Warning,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle,
  Error,
  Info,
  Delete,
  Settings,
  MonetizationOn,
  Savings,
  Timeline,
  Assessment,
  Schedule,
  Star,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'reminder' | 'analysis';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  data?: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount, loading, error } = useAppSelector((state) => state.notifications);
  const { settings } = useAppSelector((state) => state.settings);
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Get notification settings from Redux store
  const notificationSettings = {
    budgetWarnings: settings.notifications?.budget || true,
    spendingTips: settings.notifications?.push || true,
    achievements: settings.notifications?.achievements || true,
    weeklyReports: settings.notifications?.reports || true,
    pushNotifications: settings.notifications?.push || true,
  };

  useEffect(() => {
    setIsVisible(true);
    // Load notifications from backend
    dispatch(fetchNotifications());
    dispatch(getUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    // Update filters when tab changes
    const filters: any = { offset: 0 };
    
    switch (activeTab) {
      case 1: // Chưa đọc
        filters.isRead = false;
        break;
      case 2: // Cảnh báo
        filters.type = 'warning';
        break;
      case 3: // Gợi ý
        filters.type = 'suggestion';
        break;
      case 4: // Thành tựu
        filters.type = 'achievement';
        break;
    }
    
    dispatch(updateFilters(filters));
    dispatch(fetchNotifications(filters));
  }, [activeTab, dispatch]);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      sx: { 
        fontSize: 28,
        color: 'white'
      }
    };

    switch (type) {
      case 'warning':
        return <Warning {...iconProps} />;
      case 'suggestion':
        return <Lightbulb {...iconProps} />;
      case 'achievement':
        return <Star {...iconProps} />;
      case 'analysis':
        return <Assessment {...iconProps} />;
      case 'reminder':
        return <Schedule {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return '#e74c3c';
    
    switch (type) {
      case 'warning':
        return '#f39c12';
      case 'suggestion':
        return '#3498db';
      case 'achievement':
        return '#27ae60';
      case 'analysis':
        return '#9b59b6';
      case 'reminder':
        return '#34495e';
      default:
        return '#95a5a6';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 0: // Tất cả
        return notifications;
      case 1: // Chưa đọc
        return notifications.filter(n => !n.isRead);
      case 2: // Cảnh báo
        return notifications.filter(n => n.type === 'warning');
      case 3: // Gợi ý
        return notifications.filter(n => n.type === 'suggestion');
      case 4: // Thành tựu
        return notifications.filter(n => n.type === 'achievement');
      default:
        return notifications;
    }
  };

  // Use counts from Redux store
  const warningCount = notifications.filter(n => n.type === 'warning' && !n.isRead).length;
  const suggestionCount = notifications.filter(n => n.type === 'suggestion' && !n.isRead).length;
  const achievementCount = notifications.filter(n => n.type === 'achievement' && !n.isRead).length;

  const NotificationCard = ({ notification, index }: { notification: Notification; index: number }) => (
    <Grow in={isVisible} timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card
        sx={{
          mb: 2,
          opacity: notification.isRead ? 0.7 : 1,
          border: notification.isRead ? '1px solid #e9ecef' : `2px solid ${getNotificationColor(notification.type, notification.priority)}20`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(8px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: getNotificationColor(notification.type, notification.priority),
                width: 48,
                height: 48,
              }}
            >
              {getNotificationIcon(notification.type, notification.priority)}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {notification.title}
                </Typography>
                {!notification.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#3498db',
                    }}
                  />
                )}
                <Chip
                  label={notification.priority === 'high' ? 'Cao' : notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  size="small"
                  color={notification.priority === 'high' ? 'error' : notification.priority === 'medium' ? 'warning' : 'default'}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                {notification.message}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(notification.timestamp)}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {notification.actionable && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Thực hiện
                    </Button>
                  )}
                  {!notification.isRead && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(notification.id)}
                    sx={{ color: '#e74c3c' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Fade in={isVisible} timeout={800}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              🔔 Thông Báo & Gợi Ý
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Theo dõi cảnh báo và nhận gợi ý tài chính thông minh
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              sx={{ textTransform: 'none' }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive sx={{ fontSize: 32, color: '#3498db' }} />
            </Badge>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Slide direction="up" in={isVisible} timeout={1000}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ px: 2 }}
                >
                  <Tab 
                    label={
                      <Badge badgeContent={notifications.length} color="primary" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        Tất cả
                      </Badge>
                    } 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        Chưa đọc
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={warningCount} color="warning" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        Cảnh báo
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={suggestionCount} color="info" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        Gợi ý
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={achievementCount} color="success" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        Thành tựu
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification, index) => (
                      <NotificationCard key={notification.id} notification={notification} index={index} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <NotificationsActive sx={{ fontSize: 64, color: '#bdc3c7', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Không có thông báo nào
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 3 }}>
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification, index) => (
                      <NotificationCard key={notification.id} notification={notification} index={index} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CheckCircle sx={{ fontSize: 64, color: '#27ae60', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Tất cả thông báo đã được đọc!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3 }}>
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification, index) => (
                      <NotificationCard key={notification.id} notification={notification} index={index} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CheckCircle sx={{ fontSize: 64, color: '#27ae60', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Không có cảnh báo nào!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chi tiêu của bạn đang trong tầm kiểm soát
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 3 }}>
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification, index) => (
                      <NotificationCard key={notification.id} notification={notification} index={index} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Lightbulb sx={{ fontSize: 64, color: '#f39c12', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Chưa có gợi ý mới
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <Box sx={{ p: 3 }}>
                  {getFilteredNotifications().length > 0 ? (
                    getFilteredNotifications().map((notification, index) => (
                      <NotificationCard key={notification.id} notification={notification} index={index} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Star sx={{ fontSize: 64, color: '#f39c12', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Chưa có thành tựu mới
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hãy tiếp tục quản lý tài chính tốt để đạt được thành tựu!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </Paper>
          </Slide>
        </Grid>

        {/* Settings Sidebar */}
        <Grid item xs={12} lg={4}>
          <Slide direction="left" in={isVisible} timeout={1200}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings /> Cài Đặt Thông Báo
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.budgetWarnings}
                      onChange={(e) => {
                        // TODO: Update setting via Redux
                        console.log('Update budget warnings:', e.target.checked);
                      }}
                    />
                  }
                  label="Cảnh báo ngân sách"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.spendingTips}
                      onChange={(e) => {
                        // TODO: Update setting via Redux
                        console.log('Update spending tips:', e.target.checked);
                      }}
                    />
                  }
                  label="Gợi ý tiết kiệm"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.achievements}
                      onChange={(e) => {
                        // TODO: Update setting via Redux
                        console.log('Update achievements:', e.target.checked);
                      }}
                    />
                  }
                  label="Thông báo thành tựu"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => {
                        // TODO: Update setting via Redux
                        console.log('Update weekly reports:', e.target.checked);
                      }}
                    />
                  }
                  label="Báo cáo hàng tuần"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => {
                        // TODO: Update setting via Redux
                        console.log('Update push notifications:', e.target.checked);
                      }}
                    />
                  }
                  label="Thông báo đẩy"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📊 Thống Kê Thông Báo
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tổng thông báo:</Typography>
                  <Chip label={notifications.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Chưa đọc:</Typography>
                  <Chip label={unreadCount} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cảnh báo:</Typography>
                  <Chip label={warningCount} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Gợi ý:</Typography>
                  <Chip label={suggestionCount} color="info" size="small" />
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationsPage;
