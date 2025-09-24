import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Fade,
  Slide,
  Grow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  CloudUpload,
  CloudDownload,
  Edit,
  Save,
  Logout,
  Delete,
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  Work,
  Cake,
  Settings as SettingsIcon,
  Info,
  Help,
  Policy,
  Backup,
  Restore,
  Download,
  Upload,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchSettings, 
  updateSetting, 
  updateMultipleSettings, 
  createBackup, 
  fetchBackupHistory,
  resetSettings as resetSettingsAction,
  updateLocalSetting
} from '../../store/slices/settingsSlice';
import { updateUser } from '../../store/slices/authSlice';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { settings, backupHistory, loading, error } = useAppSelector((state) => state.settings);
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    occupation: '',
    dateOfBirth: '',
    avatar: user?.avatar || '',
  });

  // Get settings from Redux store with fallbacks
  const appSettings = {
    theme: settings.appearance?.theme || 'light',
    language: settings.appearance?.language || 'vi',
    currency: settings.appearance?.currency || 'VND',
    notifications: {
      push: settings.notifications?.push || true,
      email: settings.notifications?.email || true,
      budget: settings.notifications?.budget || true,
      achievements: settings.notifications?.achievements || true,
      reports: settings.notifications?.reports || true,
    },
    privacy: {
      showProfile: settings.privacy?.show_profile || true,
      shareData: settings.privacy?.share_data || false,
      analytics: settings.privacy?.analytics || true,
    },
    backup: {
      autoBackup: settings.backup?.auto_backup || true,
      frequency: settings.backup?.backup_frequency || 'weekly',
      lastBackup: backupHistory[0]?.createdAt || '2025-09-15T10:30:00',
    },
  };

  useEffect(() => {
    setIsVisible(true);
    // Load settings from backend
    dispatch(fetchSettings());
    dispatch(fetchBackupHistory());
  }, [dispatch]);

  const handleProfileSave = async () => {
    try {
      await dispatch(updateUser(profileData)).unwrap();
      setEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSettingChange = async (category: string, setting: string, value: any) => {
    try {
      // Update local state immediately for better UX
      dispatch(updateLocalSetting({ category, key: setting, value }));
      
      // Determine the correct type
      let type = 'string';
      if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'number') type = 'number';
      
      // Update on backend
      await dispatch(updateSetting({ category, key: setting, value, type })).unwrap();
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert local change on error
      dispatch(fetchSettings(category));
    }
  };

  const handleBackup = async () => {
    try {
      const result = await dispatch(createBackup()).unwrap();
      console.log('Backup created successfully:', result);
      
      // Download backup file
      const blob = new Blob([result.downloadData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setOpenBackupDialog(false);
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const handleRestore = () => {
    // Create file input for restore
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const backupData = JSON.parse(e.target?.result as string);
            console.log('Restore data:', backupData);
            // TODO: Implement restore API call
            alert('Tính năng khôi phục sẽ được triển khai trong phiên bản tiếp theo');
          } catch (error) {
            console.error('Invalid backup file:', error);
            alert('File sao lưu không hợp lệ');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportData = () => {
    // TODO: Implement data export to Excel/PDF
    console.log('Exporting data...');
    alert('Tính năng xuất dữ liệu sẽ được triển khai trong phiên bản tiếp theo');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Deleting account...');
    alert('Tính năng xóa tài khoản sẽ được triển khai trong phiên bản tiếp theo');
    setOpenDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Fade in={isVisible} timeout={800}>
        <Box sx={{ mb: 4 }}>
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
            ⚙️ Cài Đặt
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Quản lý tài khoản và tùy chỉnh ứng dụng
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} lg={4}>
          <Slide direction="right" in={isVisible} timeout={1000}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
            >
              <Avatar
                src={profileData.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                }}
              >
                {profileData.firstName?.charAt(0) || 'U'}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                {profileData.email}
              </Typography>
              
              <Chip
                label="Tài khoản Premium"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  mb: 3,
                }}
              />
              
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditingProfile(true)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Chỉnh Sửa Hồ Sơ
              </Button>
            </Paper>
          </Slide>
        </Grid>

        {/* Settings Tabs */}
        <Grid item xs={12} lg={8}>
          <Slide direction="left" in={isVisible} timeout={1200}>
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
                    icon={<Person />} 
                    label="Tài khoản" 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    icon={<Notifications />} 
                    label="Thông báo" 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    icon={<Palette />} 
                    label="Giao diện" 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    icon={<Security />} 
                    label="Bảo mật" 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab 
                    icon={<Backup />} 
                    label="Sao lưu" 
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              {/* Account Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Thông Tin Tài Khoản
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Họ"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Tên"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editingProfile}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editingProfile}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Địa chỉ"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!editingProfile}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nghề nghiệp"
                        value={profileData.occupation}
                        onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                        disabled={!editingProfile}
                        InputProps={{
                          startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ngày sinh"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!editingProfile}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: <Cake sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {editingProfile && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleProfileSave}
                        sx={{ textTransform: 'none' }}
                      >
                        Lưu Thay Đổi
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingProfile(false)}
                        sx={{ textTransform: 'none' }}
                      >
                        Hủy
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Cài Đặt Thông Báo
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Notifications />
                      </ListItemIcon>
                      <ListItemText
                        primary="Thông báo đẩy"
                        secondary="Nhận thông báo trên thiết bị"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Thông báo email"
                        secondary="Nhận thông báo qua email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Info />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cảnh báo ngân sách"
                        secondary="Thông báo khi vượt ngân sách"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.notifications.budget}
                          onChange={(e) => handleSettingChange('notifications', 'budget', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Help />
                      </ListItemIcon>
                      <ListItemText
                        primary="Báo cáo định kỳ"
                        secondary="Nhận báo cáo hàng tuần/tháng"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.notifications.reports}
                          onChange={(e) => handleSettingChange('notifications', 'reports', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Box>
              </TabPanel>

              {/* Appearance Tab */}
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Giao Diện & Ngôn Ngữ
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Chủ đề</InputLabel>
                        <Select
                          value={appSettings.theme}
                          label="Chủ đề"
                          onChange={(e) => handleSettingChange('', 'theme', e.target.value)}
                        >
                          <MenuItem value="light">Sáng</MenuItem>
                          <MenuItem value="dark">Tối</MenuItem>
                          <MenuItem value="auto">Tự động</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Ngôn ngữ</InputLabel>
                        <Select
                          value={appSettings.language}
                          label="Ngôn ngữ"
                          onChange={(e) => handleSettingChange('', 'language', e.target.value)}
                        >
                          <MenuItem value="vi">Tiếng Việt</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Đơn vị tiền tệ</InputLabel>
                        <Select
                          value={appSettings.currency}
                          label="Đơn vị tiền tệ"
                          onChange={(e) => handleSettingChange('', 'currency', e.target.value)}
                        >
                          <MenuItem value="VND">VND (₫)</MenuItem>
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={activeTab} index={3}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Bảo Mật & Quyền Riêng Tư
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và kích hoạt xác thực 2 bước.
                  </Alert>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Security />
                      </ListItemIcon>
                      <ListItemText
                        primary="Đổi mật khẩu"
                        secondary="Cập nhật mật khẩu định kỳ"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                          Đổi mật khẩu
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary="Hiển thị hồ sơ công khai"
                        secondary="Cho phép người khác xem hồ sơ"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.privacy.showProfile}
                          onChange={(e) => handleSettingChange('privacy', 'showProfile', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Info />
                      </ListItemIcon>
                      <ListItemText
                        primary="Chia sẻ dữ liệu phân tích"
                        secondary="Giúp cải thiện ứng dụng"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={appSettings.privacy.analytics}
                          onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#e74c3c' }}>
                    Vùng Nguy Hiểm
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setOpenDeleteDialog(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Xóa Tài Khoản
                  </Button>
                </Box>
              </TabPanel>

              {/* Backup Tab */}
              <TabPanel value={activeTab} index={4}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Sao Lưu & Khôi Phục
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Lần sao lưu cuối: {formatDate(appSettings.backup.lastBackup)}
                  </Alert>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <CloudUpload sx={{ fontSize: 48, color: '#3498db', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Sao Lưu Dữ Liệu
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Tạo bản sao lưu dữ liệu của bạn
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Backup />}
                          onClick={() => setOpenBackupDialog(true)}
                          sx={{ textTransform: 'none' }}
                        >
                          Tạo Sao Lưu
                        </Button>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <CloudDownload sx={{ fontSize: 48, color: '#27ae60', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Khôi Phục Dữ Liệu
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Khôi phục từ bản sao lưu
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Restore />}
                          onClick={handleRestore}
                          sx={{ textTransform: 'none' }}
                        >
                          Khôi Phục
                        </Button>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Xuất Dữ Liệu
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Tải xuống dữ liệu của bạn dưới định dạng Excel hoặc PDF
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExportData}
                            sx={{ textTransform: 'none' }}
                          >
                            Xuất Excel
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExportData}
                            sx={{ textTransform: 'none' }}
                          >
                            Xuất PDF
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.backup.autoBackup}
                          onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                        />
                      }
                      label="Tự động sao lưu hàng tuần"
                    />
                  </Box>
                </Box>
              </TabPanel>
            </Paper>
          </Slide>
        </Grid>
      </Grid>

      {/* Backup Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)}>
        <DialogTitle>Tạo Sao Lưu Dữ Liệu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn có muốn tạo bản sao lưu dữ liệu không? Quá trình này có thể mất vài phút.
          </Typography>
          <Alert severity="info">
            Bản sao lưu sẽ bao gồm tất cả giao dịch, danh mục và cài đặt của bạn.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button onClick={handleBackup} variant="contained" sx={{ textTransform: 'none' }}>
            Tạo Sao Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ color: '#e74c3c' }}>Xóa Tài Khoản</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </Alert>
          <Typography variant="body2">
            Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
          </Typography>
          <ul>
            <li>Tất cả giao dịch và lịch sử</li>
            <li>Danh mục và ngân sách</li>
            <li>Báo cáo và thống kê</li>
            <li>Cài đặt cá nhân</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" sx={{ textTransform: 'none' }}>
            Xóa Tài Khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
