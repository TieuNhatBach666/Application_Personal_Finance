import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    LinearProgress,
    Fade,
    Slide,
    Grow,
} from '@mui/material';
import {
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    ShowChart,
    TrendingUp,
    TrendingDown,
    AccountBalance,
    Timeline,
    FileDownload,
    Warning,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTransactionSummary } from '../../store/slices/transactionSlice';
import PieChart from '../../components/Charts/PieChart';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';
import { fetchCategories } from '../../store/slices/categorySlice';

const StatisticsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { summary } = useAppSelector((state) => state.transactions);

    const [isVisible, setIsVisible] = useState(false);
    const [activeChart, setActiveChart] = useState('pie');
    const [timePeriod, setTimePeriod] = useState('month');
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                // Calculate date range based on selected time period
                const now = new Date();
                let startDate: string;
                let endDate: string;

                switch (timePeriod) {
                    case 'week':
                        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                        startDate = weekStart.toISOString().split('T')[0];
                        endDate = new Date().toISOString().split('T')[0];
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                        break;
                    case 'quarter':
                        const quarter = Math.floor(now.getMonth() / 3);
                        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
                        break;
                    case 'year':
                        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
                        break;
                    default:
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                }

                // Fetch summary data
                dispatch(fetchTransactionSummary({ startDate, endDate }));

                // Fetch category breakdown
                const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                if (token) {
                    const response = await fetch(
                        `http://localhost:5000/api/statistics/by-category?startDate=${startDate}&endDate=${endDate}&type=Expense`,
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
                    } else {
                        console.error('Failed to fetch category statistics');
                        setCategoryData([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setCategoryData([]);
            } finally {
                setLoading(false);
                setIsVisible(true);
            }
        };

        fetchStatistics();
    }, [dispatch, timePeriod]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getTimePeriodLabel = () => {
        switch (timePeriod) {
            case 'week': return 'Tuần này';
            case 'month': return 'Tháng này';
            case 'quarter': return 'Quý này';
            case 'year': return 'Năm này';
            default: return 'Tháng này';
        }
    };

    // Use only real data from API
    const categoryBreakdown = categoryData;

    const StatCard = ({
        title,
        value,
        icon,
        color,
        growth,
        delay
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
                        {formatCurrency(value)}
                    </Typography>
                </CardContent>
            </Card>
        </Grow>
    );

    return (
        <Box sx={{ p: 3 }}>
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
                            📊 Thống Kê & Báo Cáo
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Phân tích chi tiết tình hình tài chính của bạn
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Thời gian</InputLabel>
                            <Select
                                value={timePeriod}
                                label="Thời gian"
                                onChange={(e) => setTimePeriod(e.target.value)}
                            >
                                <MenuItem value="week">Tuần này</MenuItem>
                                <MenuItem value="month">Tháng này</MenuItem>
                                <MenuItem value="quarter">Quý này</MenuItem>
                                <MenuItem value="year">Năm này</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            sx={{ textTransform: 'none' }}
                        >
                            Xuất Báo Cáo
                        </Button>
                    </Box>
                </Box>
            </Fade>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={`Thu nhập ${getTimePeriodLabel().toLowerCase()}`}
                        value={summary.totalIncome}
                        icon={<TrendingUp sx={{ color: 'white', fontSize: 28 }} />}
                        color="#27ae60"
                        growth={12.5}
                        delay={0}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={`Chi tiêu ${getTimePeriodLabel().toLowerCase()}`}
                        value={summary.totalExpense}
                        icon={<TrendingDown sx={{ color: 'white', fontSize: 28 }} />}
                        color="#e74c3c"
                        growth={-8.3}
                        delay={200}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={`Tiết kiệm ${getTimePeriodLabel().toLowerCase()}`}
                        value={summary.netSavings}
                        icon={
                            summary.netSavings >= 0 ?
                                <AccountBalance sx={{ color: 'white', fontSize: 28 }} /> :
                                <Warning sx={{ color: 'white', fontSize: 28 }} />
                        }
                        color={summary.netSavings >= 0 ? "#3498db" : "#e74c3c"}
                        growth={25.7}
                        delay={400}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Số giao dịch"
                        value={summary.transactionCount}
                        icon={<Timeline sx={{ color: 'white', fontSize: 28 }} />}
                        color="#9b59b6"
                        delay={600}
                    />
                </Grid>
            </Grid>

            {/* Negative Savings Warning */}
            {summary.netSavings < 0 && (
                <Fade in={isVisible} timeout={1500}>
                    <Paper
                        sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #e74c3c15 0%, #c0392b05 100%)',
                            border: '1px solid #e74c3c30',
                            boxShadow: '0 8px 25px rgba(231, 76, 60, 0.15)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Warning sx={{ color: '#e74c3c', fontSize: 32 }} />
                            <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 700 }}>
                                🚨 Cảnh báo: Chi tiêu vượt thu nhập!
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: '#2c3e50', mb: 2 }}>
                            Trong {getTimePeriodLabel().toLowerCase()}, bạn đang chi tiêu nhiều hơn thu nhập.
                            Số tiền thiếu hụt: <strong style={{ color: '#e74c3c' }}>
                                {formatCurrency(Math.abs(summary.netSavings))}
                            </strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
                            💡 <strong>Gợi ý cải thiện:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="Phân tích chi tiêu theo danh mục"
                                size="small"
                                sx={{ backgroundColor: '#e74c3c20', color: '#e74c3c' }}
                            />
                            <Chip
                                label="Đặt ngân sách chặt chẽ hơn"
                                size="small"
                                sx={{ backgroundColor: '#f39c1220', color: '#f39c12' }}
                            />
                            <Chip
                                label="Tìm nguồn thu nhập phụ"
                                size="small"
                                sx={{ backgroundColor: '#27ae6020', color: '#27ae60' }}
                            />
                        </Box>
                    </Paper>
                </Fade>
            )}

            {/* Charts Section */}
            <Grid container spacing={3}>
                {/* Main Chart */}
                <Grid size={{ xs: 12, lg: 8 }}>
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
                                    Chi Tiêu Theo Danh Mục - {getTimePeriodLabel()}
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

                            {/* Chart Display */}
                            <Box sx={{ height: 300, position: 'relative' }}>
                                {loading ? (
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
                                ) : categoryBreakdown.length > 0 ? (
                                    <>
                                        {activeChart === 'pie' && (
                                            <PieChart data={categoryBreakdown} title={`Chi tiêu theo danh mục - ${getTimePeriodLabel()}`} />
                                        )}
                                        {activeChart === 'bar' && (
                                            <BarChart data={categoryBreakdown} title={`Chi tiêu theo danh mục - ${getTimePeriodLabel()}`} />
                                        )}
                                        {activeChart === 'line' && (
                                            <LineChart data={categoryBreakdown} title={`Chi tiêu theo danh mục - ${getTimePeriodLabel()}`} />
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
                                        <ShowChart sx={{ fontSize: 64, opacity: 0.3 }} />
                                        <Typography variant="h6" color="text.secondary">
                                            Chưa có dữ liệu thống kê
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Hãy tạo một số giao dịch để xem biểu đồ thống kê chi tiêu theo danh mục
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Slide>
                </Grid>

                {/* Category Breakdown */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Slide direction="left" in={isVisible} timeout={1200}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #f39c1210 0%, #e67e2210 100%)',
                                border: '1px solid #f39c1220',
                                minHeight: 400,
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
                                {categoryBreakdown.length > 0 ? (
                                    categoryBreakdown.map((category) => (
                                        <Box key={category.name}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                                        {category.icon}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {category.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: `${category.color}20`,
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: category.color,
                                                        borderRadius: 4,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            py: 4,
                                            color: 'text.secondary',
                                        }}
                                    >
                                        <PieChartIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary" textAlign="center">
                                            Chưa có dữ liệu chi tiêu
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Tạo giao dịch chi tiêu để xem phân tích
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e9ecef' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Tổng chi tiêu:
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                                        {formatCurrency(summary.totalExpense)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Slide>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatisticsPage;