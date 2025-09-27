import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Fade,
  Slide,
  Grow,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  AttachMoney,
  Timeline,
  NotificationsActive,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchBudgets,
  fetchBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
  Budget,
  CreateBudgetData
} from '../../store/slices/budgetSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { formatCurrencyCompact, formatCurrencyFull, formatPercentage } from '../../utils/formatCurrency';
import { useUserSettings } from '../../hooks/useUserSettings';
import NotificationWarning from '../../components/NotificationWarning';

const BudgetPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: categories } = useAppSelector((state) => state.categories);
  const { budgets, summary: budgetSummary, loading, error } = useAppSelector((state) => state.budgets);
  const { settings } = useAppSelector((state) => state.settings);
  const { getText } = useUserSettings();

  // Get currency from settings
  const currency = settings.appearance?.currency || 'VND';

  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    totalAmount: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    warningThreshold: 80,
    color: '#3498db',
  });

  useEffect(() => {
    setIsVisible(true);
    // Fetch real data from API
    dispatch(fetchBudgets());
    dispatch(fetchBudgetSummary());
    dispatch(fetchCategories());

    // Fetch notifications for warnings
    dispatch(fetchNotifications({}));
  }, [dispatch]);

  // Debug: Log budgets data
  useEffect(() => {
    console.log('🔍 Budgets Debug:', { budgets, loading, error });
  }, [budgets, loading, error]);

  // Remove old formatCurrency function - using formatCurrencyCompact/Full with currency setting

  const getProgressColor = (percentage: number, warningThreshold: number) => {
    if (percentage >= 100) return '#e74c3c';
    if (percentage >= warningThreshold) return '#f39c12';
    return '#27ae60';
  };

  const getProgressStatus = (percentage: number, warningThreshold: number) => {
    if (percentage >= 100) return 'Vượt ngân sách';
    if (percentage >= warningThreshold) return 'Gần vượt hạn mức';
    return 'Trong tầm kiểm soát';
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget.id);
      setFormData({
        name: budget.name,
        categoryId: budget.categoryId || '',
        totalAmount: budget.totalAmount.toString(),
        period: budget.period,
        warningThreshold: budget.warningThreshold,
        color: budget.color,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: '',
        categoryId: '',
        totalAmount: '',
        period: 'monthly',
        warningThreshold: 80,
        color: '#3498db',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSubmit = async () => {
    try {
      const budgetData: CreateBudgetData = {
        name: formData.name,
        categoryId: formData.categoryId || undefined,
        totalAmount: parseFloat(formData.totalAmount),
        period: formData.period,
        warningThreshold: formData.warningThreshold,
        color: formData.color,
      };

      if (editingBudget) {
        await dispatch(updateBudget({ id: editingBudget, ...budgetData })).unwrap();
      } else {
        await dispatch(createBudget(budgetData)).unwrap();
      }
      
      handleCloseDialog();
      // Refresh both budgets list and summary after creating/updating budget
      dispatch(fetchBudgets());
      dispatch(fetchBudgetSummary());
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      try {
        await dispatch(deleteBudget(budgetId)).unwrap();
        // Refresh both budgets list and summary after deleting budget
        dispatch(fetchBudgets());
        dispatch(fetchBudgetSummary());
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const BudgetCard = ({ budget, index }: { budget: Budget; index: number }) => {
    const spentAmount = budget.SpentAmount || budget.spentAmount || 0;
    const totalAmount = budget.BudgetAmount || budget.totalAmount || 1;
    const warningThreshold = budget.WarningThreshold || budget.warningThreshold || 80;
    const budgetName = budget.BudgetName || budget.name || 'Ngân sách';
    const budgetColor = budget.Color || budget.color || '#3498db';
    
    // Debug logs
    console.log('🔍 Budget Debug:', {
      budgetName,
      spentAmount,
      totalAmount,
      SpentAmount: budget.SpentAmount,
      BudgetAmount: budget.BudgetAmount,
      rawBudget: budget
    });
    
    // Tính percentage an toàn
    let percentage = 0;
    if (totalAmount > 0 && spentAmount >= 0) {
      percentage = (spentAmount / totalAmount) * 100;
    }
    
    console.log('📊 Percentage calculation:', { 
      spentAmount, 
      totalAmount, 
      percentage,
      isValidCalculation: totalAmount > 0 && spentAmount >= 0
    });
    const progressColor = getProgressColor(percentage, warningThreshold);
    const status = getProgressStatus(percentage, warningThreshold);
    const remaining = totalAmount - spentAmount;

    return (
      <Grow in={isVisible} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
        <Card
          sx={{
            height: '100%',
            minHeight: '280px',
            background: `linear-gradient(135deg, ${budgetColor}15 0%, ${budgetColor}05 100%)`,
            border: `1px solid ${budgetColor}30`,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 20px 40px ${budgetColor}20`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${budgetColor} 0%, ${budgetColor}80 100%)`,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: budgetColor, mb: 0.5 }}>
                  {budgetName}
                </Typography>
                <Chip
                  label={status}
                  color={percentage >= 100 ? 'error' : percentage >= warningThreshold ? 'warning' : 'success'}
                  size="small"
                  icon={percentage >= warningThreshold ? <Warning /> : <TrendingUp />}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(budget)}
                  sx={{ color: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(budget.BudgetID || budget.id)}
                  sx={{ color: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Đã chi tiêu
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatPercentage(percentage)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${progressColor}20`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressColor,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Đã chi
                </Typography>
                <Tooltip title={formatCurrencyFull(spentAmount, currency)} arrow>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                    {formatCurrencyCompact(spentAmount, currency)}
                  </Typography>
                </Tooltip>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Còn lại
                </Typography>
                <Tooltip title={formatCurrencyFull(remaining, currency)} arrow>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: remaining >= 0 ? '#27ae60' : '#e74c3c'
                    }}
                  >
                    {formatCurrencyCompact(remaining, currency)}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ pt: 2, borderTop: '1px solid #e9ecef' }}>
              <Tooltip title={formatCurrencyFull(totalAmount, currency)} arrow>
                <Typography variant="caption" color="text.secondary">
                  Tổng ngân sách: {formatCurrencyCompact(totalAmount, currency)}
                </Typography>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  const totalBudget = budgetSummary?.totalBudgetAmount || 0;
  const totalSpent = budgetSummary?.totalSpentAmount || 0;
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = budgetSummary?.averageUsagePercentage || 0;

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
              💰 {getText('budgetManagement')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getText('budgetSubtitle')}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 8px 20px rgba(39, 174, 96, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 25px rgba(39, 174, 96, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {getText('createBudget')}
          </Button>
        </Box>
      </Fade>

      {/* Overall Budget Summary */}
      <Slide direction="up" in={isVisible} timeout={1000}>
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid #4a5568'
              : '1px solid #e9ecef',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h6" sx={{
            fontWeight: 700,
            color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#2c3e50',
            mb: 2
          }}>
            📊 {getText('monthlyBudgetOverview')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Tooltip title={formatCurrencyFull(totalBudget, currency)} arrow>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#3498db', mb: 0.5 }}>
                    {formatCurrencyCompact(totalBudget, currency)}
                  </Typography>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">
                  Tổng Ngân Sách
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Tooltip title={formatCurrencyFull(totalSpent, currency)} arrow>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#e74c3c', mb: 0.5 }}>
                    {formatCurrencyCompact(totalSpent, currency)}
                  </Typography>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">
                  Đã Chi Tiêu
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Tooltip title={formatCurrencyFull(totalRemaining, currency)} arrow>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: totalRemaining >= 0 ? '#27ae60' : '#e74c3c',
                      mb: 0.5
                    }}
                  >
                    {formatCurrencyCompact(totalRemaining, currency)}
                  </Typography>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">
                  Còn Lại
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f39c12', mb: 0.5 }}>
                  {Math.round(overallPercentage)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tỷ Lệ Sử Dụng
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(overallPercentage, 100)}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#e9ecef',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProgressColor(overallPercentage, 80),
                  borderRadius: 6,
                },
              }}
            />
          </Box>
        </Paper>
      </Slide>

      {/* Notification-based Budget Warnings */}
      <NotificationWarning
        type="budget"
        variant="alert"
        dismissible={true}
        timeout={1500}
      />

      {/* Budget Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {budgets.filter(budget => budget && (budget.id || budget.BudgetID)).map((budget, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={budget.id || budget.BudgetID || index}>
            <BudgetCard budget={budget} index={index} />
          </Grid>
        ))}
        
        {budgets.filter(budget => budget && (budget.id || budget.BudgetID)).length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {getText('noBudgetsYet')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {getText('createFirstBudget')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ textTransform: 'none' }}
              >
                {getText('createFirstBudgetBtn')}
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Budget Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBudget ? getText('editBudget') : getText('createNewBudget')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Tên ngân sách"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Ngân sách tháng 9, Chi tiêu ăn uống..."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục (tùy chọn)</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Danh mục (tùy chọn)"
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    <MenuItem value="">Tất cả danh mục</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.CategoryID || category.id} value={category.CategoryID || category.id}>
                        {category.icon} {category.CategoryName || category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Số tiền ngân sách"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="VD: 5000000"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Chu kỳ</InputLabel>
                  <Select
                    value={formData.period}
                    label="Chu kỳ"
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as any }))}
                  >
                    <MenuItem value="daily">Hàng ngày</MenuItem>
                    <MenuItem value="weekly">Hàng tuần</MenuItem>
                    <MenuItem value="monthly">Hàng tháng</MenuItem>
                    <MenuItem value="quarterly">Hàng quý</MenuItem>
                    <MenuItem value="yearly">Hàng năm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mức cảnh báo (%)"
                  type="number"
                  value={formData.warningThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, warningThreshold: parseInt(e.target.value) }))}
                  inputProps={{ min: 50, max: 95 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Màu sắc"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.totalAmount || loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? getText('processing') : (editingBudget ? getText('update') : getText('createBudget'))}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default BudgetPage;
