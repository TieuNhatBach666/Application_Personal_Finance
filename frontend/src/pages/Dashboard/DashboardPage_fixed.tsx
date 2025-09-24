import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Fade,
  Slide,
  Grow,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Savings,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart,
  Notifications,
  Star,
  ArrowUpward,
  ArrowDownward,
  AccountBalance,
  Timeline,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchTransactionSummary, fetchTransactions } from '../../store/slices/transactionSlice';
import { getCurrentUser } from '../../store/slices/authSlice';
import PieChart from '../../components/Charts/PieChart';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: categories } = useAppSelector((state) => state.categories);
  const { summary, items: recentTransactions, loading } = useAppSelector((state) => state.transactions);
  const [isVisible, setIsVisible] = useState(true);
  const [activeChart, setActiveChart] = useState('pie');
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Check if user data is available, if not try to get current user
    if (!user && !loading) {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) {
        console.log('🔄 Dashboard: User not found, fetching current user...');
        dispatch(getCurrentUser());
      }
    }
    
    // Prevent multiple calls in StrictMode
    if (fetchedRef.current) {
      console.log('🚫 Dashboard: Skipping duplicate fetch');
      return;
    }
    fetchedRef.current = true;
    
    const fetchDashboardData = async () => {
      console.log('🔄 Dashboard: Starting data fetch...');
      
      dispatch(fetchCategories());
      
      // Fetch current month's transaction summary
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      console.log('📅 Dashboard: Fetching summary for', startOfMonth, 'to', endOfMonth);
      
      // Wait for summary to complete
      try {
        await dispatch(fetchTransactionSummary({
          startDate: startOfMonth,
          endDate: endOfMonth
        })).unwrap();
        
        console.log('✅ Dashboard: Summary loaded successfully');
      } catch (error) {
        console.error('❌ Dashboard: Summary failed:', error);
        return;
      }
      
      // Fetch recent transactions (last 5)
      dispatch(fetchTransactions({ page: 1, limit: 5 }));
      
      // Fetch category breakdown for chart
      setChartLoading(true);
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
          console.log('📊 Dashboard: Fetching category data...');
          
          const response = await fetch(
            `http://localhost:5000/api/statistics/by-category?startDate=${startOfMonth}&endDate=${endOfMonth}&type=Expense`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            setCategoryData(result.data.categories || []);
            console.log('✅ Dashboard: Category data loaded:', result.data.categories?.length || 0, 'categories');
          } else {
            console.error('❌ Dashboard: Failed to fetch category statistics');
            setCategoryData([]);
          }
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching category statistics:', error);
        setCategoryData([]);
      } finally {
        setChartLoading(false);
      }
      
      setIsVisible(true);
      setDataLoaded(true);
      console.log('🎉 Dashboard: All data loaded');
    };

    fetchDashboardData();
  }, [dispatch]);

  // Add effect to handle summary changes
  useEffect(() => {
    // Set dataLoaded when summary is available (even if all values are 0)
    if (summary && (summary.totalIncome !== undefined && summary.totalExpense !== undefined)) {
      setDataLoaded(true);
    }
  }, [summary]);

  // Use categoryData directly (fallback already handled in fetch logic like Statistics page)
  const categoryBreakdown = categoryData;

  // Show loading indicator only when actually loading
  const isDataLoading = loading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    growth,
    delay,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    growth?: number;
    delay: number;
  }) => (
    <Grow in={isVisible} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${color}20`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: `0 8px 20px ${color}30`,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              {growth !== undefined && (
                <Chip
                  label={`${growth > 0 ? '+' : ''}${growth}%`}
                  color={growth > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: color,
              fontSize: '1.8rem',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress sx={{ width: 100, height: 4 }} />
                <Typography variant="caption" color="text.secondary">
                  Đang tải...
                </Typography>
              </Box>
            ) : title === 'Số giao dịch' ? (
              value
            ) : (
              formatCurrency(value)
            )}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Welcome Section */}
      <Fade in={isVisible} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                fontSize: '1.5rem'
              }}
            >
              {user?.firstName?.charAt(0) || '💰'}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                Chào mừng, {user?.firstName || 'Bạn'}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Đây là tổng quan tài chính của bạn trong tháng này
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<Star />}
              label="Tháng xuất sắc"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<Notifications />}
              label="3 thông báo mới"
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards - Same as Statistics page */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Thu nhập tháng này"
            value={summary?.totalIncome || 0}
            icon={<TrendingUp sx={{ color: 'white', fontSize: 28 }} />}
            color="#27ae60"
            growth={12.5}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chi tiêu tháng này"
            value={summary?.totalExpense || 0}
            icon={<TrendingDown sx={{ color: 'white', fontSize: 28 }} />}
            color="#e74c3c"
            growth={-8.3}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tiết kiệm tháng này"
            value={summary?.netSavings || 0}
            icon={<AccountBalance sx={{ color: 'white', fontSize: 28 }} />}
            color="#3498db"
            growth={25.7}
            delay={400}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Số giao dịch"
            value={summary?.transactionCount || 0}
            icon={<Timeline sx={{ color: 'white', fontSize: 28 }} />}
            color="#9b59b6"
            delay={600}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Chart Section */}
        <Grid item xs={12} lg={8}>
          <Slide direction="up" in={isVisible} timeout={1000}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e9ecef',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                minHeight: 400,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                  }}
                >
                  📊 Thống kê tài chính
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { key: 'pie', icon: <PieChartIcon />, label: 'Tròn' },
                    { key: 'bar', icon: <BarChartIcon />, label: 'Cột' },
                    { key: 'line', icon: <ShowChart />, label: 'Đường' },
                  ].map((chart) => (
                    <Button
                      key={chart.key}
                      variant={activeChart === chart.key ? 'contained' : 'outlined'}
                      size="small"
                      startIcon={chart.icon}
                      onClick={() => setActiveChart(chart.key)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {chart.label}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Chart Display - Only real data */}
              <Box sx={{ height: 300, position: 'relative' }}>
                {chartLoading ? (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <LinearProgress sx={{ width: '50%' }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải dữ liệu thống kê...
                    </Typography>
                  </Box>
                ) : categoryBreakdown && categoryBreakdown.length > 0 ? (
                  <>
                    {activeChart === 'pie' && (
                      <PieChart data={categoryBreakdown} title="Chi tiêu theo danh mục - Tháng này" />
                    )}
                    {activeChart === 'bar' && (
                      <BarChart data={categoryBreakdown} title="Chi tiêu theo danh mục - Tháng này" />
                    )}
                    {activeChart === 'line' && (
                      <LineChart data={categoryBreakdown} title="Chi tiêu theo danh mục - Tháng này" />
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 2,
                      color: 'text.secondary',
                    }}
                  >
                    <Box sx={{ fontSize: '3rem' }}>📊</Box>
                    <Typography variant="h6" align="center">
                      Chưa có dữ liệu chi tiêu
                    </Typography>
                    <Typography variant="body2" align="center">
                      Thêm giao dịch để xem biểu đồ phân tích
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Slide>
        </Grid>

        {/* Quick Actions & Info */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quick Actions */}
            <Slide direction="left" in={isVisible} timeout={1200}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #27ae6015 0%, #2ecc7105 100%)',
                  border: '1px solid #27ae6020',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    mb: 3,
                  }}
                >
                  ⚡ Thao tác nhanh
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
                    onClick={() => navigate('/transactions/add?type=Income')}
                    sx={{
                      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 8px 20px rgba(39, 174, 96, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #229954 0%, #27ae60 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(39, 174, 96, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Thêm Thu nhập
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
                    onClick={() => navigate('/transactions/add?type=Expense')}
                    sx={{
                      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 8px 20px rgba(231, 76, 60, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #c0392b 0%, #a93226 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(231, 76, 60, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Thêm Chi tiêu
                  </Button>
                </Box>
              </Paper>
            </Slide>

            {/* Category Breakdown - Only show with real data */}
            {categoryBreakdown && categoryBreakdown.length > 0 && (
              <Slide direction="left" in={isVisible} timeout={1400}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f39c1210 0%, #e67e2210 100%)',
                    border: '1px solid #f39c1220',
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#2c3e50',
                      mb: 3,
                    }}
                  >
                    📋 Chi Tiêu Theo Danh Mục
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {categoryBreakdown.slice(0, 4).map((category) => (
                      <Box key={category.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                              {category.icon || '📝'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {category.name}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              {formatCurrency(category.amount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {category.percentage}%
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={category.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: `${category.color || '#e9ecef'}20`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: category.color || '#3498db',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e9ecef' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Tổng chi tiêu:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                        {formatCurrency(categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0))}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => navigate('/statistics')}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#f39c12',
                        color: '#f39c12',
                        '&:hover': {
                          borderColor: '#e67e22',
                          backgroundColor: '#f39c1210',
                        },
                      }}
                    >
                      Xem chi tiết thống kê
                    </Button>
                  </Box>
                </Paper>
              </Slide>
            )}

            {/* Recent Activity */}
            <Slide direction="left" in={isVisible} timeout={1600}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #9b59b610 0%, #8e44ad10 100%)',
                  border: '1px solid #9b59b620',
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    mb: 2,
                  }}
                >
                  🕒 Hoạt động gần đây
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.slice(0, 3).map((transaction, index) => (
                      <Box key={transaction.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: transaction.type === 'Income' ? '#27ae60' : '#e74c3c',
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {transaction.category?.name || 'Không có danh mục'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: transaction.type === 'Income' ? '#27ae60' : '#e74c3c',
                          }}
                        >
                          {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Slide>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
