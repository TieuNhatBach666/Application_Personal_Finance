import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  FilterList,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTransactions, setFilters, setPagination, deleteTransaction } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

const TransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { items: transactions, loading, pagination, filters } = useAppSelector((state) => state.transactions);
  const { items: categories } = useAppSelector((state) => state.categories);
  
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTransactions({ page: 1, limit: 10 }));
    setIsVisible(true);
  }, [dispatch]);

  const handleSearch = () => {
    const newFilters = {
      search: searchTerm || undefined,
      type: selectedType || undefined,
      categoryId: selectedCategory || undefined,
    };
    
    dispatch(setFilters(newFilters));
    dispatch(fetchTransactions({ page: 1, limit: pagination.limit, filters: newFilters }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPagination({ page: value }));
    dispatch(fetchTransactions({ page: value, limit: pagination.limit, filters }));
  };

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      try {
        await dispatch(deleteTransaction(transactionToDelete)).unwrap();
        // Refresh transactions after successful deletion
        dispatch(fetchTransactions({ page: pagination.page, limit: pagination.limit, filters }));
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  // Determine default transaction type based on current route
  const getDefaultTransactionType = () => {
    if (location.pathname.includes('/income')) {
      return 'Income';
    } else if (location.pathname.includes('/expenses')) {
      return 'Expense';
    }
    return 'Expense'; // Default
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

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
              💰 Danh Sách Giao Dịch
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Quản lý tất cả thu chi của bạn
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/transactions/add?type=${getDefaultTransactionType()}`)}
            sx={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 8px 20px rgba(52, 152, 219, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 25px rgba(52, 152, 219, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {getDefaultTransactionType() === 'Income' ? 'Thêm Thu Nhập' : 'Thêm Chi Tiêu'}
          </Button>
        </Box>
      </Fade>

      {/* Filters */}
      <Slide direction="up" in={isVisible} timeout={1000}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Loại</InputLabel>
              <Select
                value={selectedType}
                label="Loại"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Income">Thu nhập</MenuItem>
                <MenuItem value="Expense">Chi tiêu</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={selectedCategory}
                label="Danh mục"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={handleSearch}
              sx={{ px: 3 }}
            >
              Lọc
            </Button>
          </Box>
        </Paper>
      </Slide>

      {/* Transaction Table */}
      <Slide direction="up" in={isVisible} timeout={1200}>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography>Đang tải...</Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction, index) => (
                    <TableRow 
                      key={transaction.id}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                      }}
                    >
                      <TableCell>
                        {formatDate(transaction.transactionDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={transaction.type === 'Income' ? <TrendingUp /> : <TrendingDown />}
                          label={transaction.type === 'Income' ? 'Thu nhập' : 'Chi tiêu'}
                          color={transaction.type === 'Income' ? 'success' : 'error'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{transaction.category?.icon}</span>
                          <span>{transaction.category?.name}</span>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: transaction.type === 'Income' ? '#27ae60' : '#e74c3c',
                          }}
                        >
                          {transaction.type === 'Income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            sx={{ color: '#3498db' }}
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log('Edit transaction:', transaction.id);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#e74c3c' }}
                            onClick={() => handleDeleteClick(transaction.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {transactions.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={Math.ceil(pagination.total / pagination.limit)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Paper>
      </Slide>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa giao dịch
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionListPage;