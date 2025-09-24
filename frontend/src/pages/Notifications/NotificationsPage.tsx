import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchNotificationCounts
} from '../../store/slices/notificationSlice';
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
import { useUserSettings } from '../../hooks/useUserSettings';

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
  const { notifications, counts, loading, error } = useAppSelector((state) => state.notifications);
  const unreadCount = counts?.unread || 0;
  const { settings } = useAppSelector((state) => state.settings);
  const { getText } = useUserSettings();
  
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
    dispatch(fetchNotificationCounts());
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
    <Box sx={{
      p: { xs: 2, md: 3 },
      height: '100vh',
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Scrollable Content Container */}
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
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
              🔔 {getText('notificationsTitle')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getText('notificationsSubtitle')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              sx={{ textTransform: 'none' }}
            >
              {getText('markAllAsRead')}
            </Button>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive sx={{ fontSize: 32, color: '#3498db' }} />
            </Badge>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
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
                        {getText('allTab')}
                      </Badge>
                    } 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        {getText('unreadTab')}
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={warningCount} color="warning" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        {getText('warningTab')}
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={suggestionCount} color="info" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        {getText('suggestionTab')}
                      </Badge>
                    }
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={achievementCount} color="success" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        {getText('achievementTab')}
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
                      <NotificationCard key={`${notification.id}-${index}`} notification={notification} index={index} />
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
                      <NotificationCard key={`${notification.id}-${index}`} notification={notification} index={index} />
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
                      <NotificationCard key={`${notification.id}-${index}`} notification={notification} index={index} />
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
                      <NotificationCard key={`${notification.id}-${index}`} notification={notification} index={index} />
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
                      <NotificationCard key={`${notification.id}-${index}`} notification={notification} index={index} />
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
        <Grid size={{ xs: 12, lg: 4 }}>
          <Slide direction="left" in={isVisible} timeout={1200}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid #4a5568'
                  : '1px solid #e9ecef',
                maxHeight: { lg: 'calc(100vh - 200px)' },
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings /> {getText('notificationSettings')}
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
                  label={getText('budgetAlerts')}
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
                  label={getText('savingTips')}
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
                  label={getText('achievementNotifications')}
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
                  label={getText('weeklyReports')}
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
                  label={getText('pushNotifications')}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📊 {getText('notificationStats')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{getText('totalNotifications')}</Typography>
                  <Chip label={notifications.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{getText('unreadLabel')}</Typography>
                  <Chip label={unreadCount} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{getText('warningLabel')}</Typography>
                  <Chip label={warningCount} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{getText('suggestionLabel')}</Typography>
                  <Chip label={suggestionCount} color="info" size="small" />
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default NotificationsPage;
