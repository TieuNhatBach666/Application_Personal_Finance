import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Save,
  Cancel,
  AttachMoney,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTransaction } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchBudgets, fetchBudgetSummary } from '../../store/slices/budgetSlice';
import { TransactionForm } from '../../types';

const AddTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { items: categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { loading: transactionLoading, error } = useAppSelector((state) => state.transactions);
  
  // Determine default type based on referrer or URL params
  const getDefaultType = (): 'Income' | 'Expense' => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    
    console.log('🔍 URL search params:', location.search);
    console.log('🎯 Type param:', typeParam);
    console.log('📍 Location state:', location.state);
    
    if (typeParam === 'Income' || typeParam === 'Expense') {
      console.log('✅ Using type from URL:', typeParam);
      return typeParam;
    }
    
    // Check if came from income button (could be passed via state)
    if (location.state?.type === 'Income') {
      console.log('✅ Using type from state: Income');
      return 'Income';
    }
    
    console.log('⚠️ Using default type: Expense');
    return 'Expense'; // Default
  };
  
  const [formData, setFormData] = useState<TransactionForm>({
    categoryId: '',
    amount: 0,
    type: getDefaultType(),
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    tags: '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Update form type when URL changes
  useEffect(() => {
    const newType = getDefaultType();
    if (newType !== formData.type) {
      console.log('🔄 Updating form type from', formData.type, 'to', newType);
      setFormData(prev => ({
        ...prev,
        type: newType,
        categoryId: '', // Reset category when type changes
      }));
    }
  }, [location.search, location.state]);

  const handleChange = (field: keyof TransactionForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.amount) {
      return;
    }

    try {
      await dispatch(createTransaction(formData)).unwrap();
      
      // Refresh budget data if this is an expense transaction
      if (formData.type === 'Expense') {
        console.log('🔄 Refreshing budget data after expense transaction');
        dispatch(fetchBudgets());
        dispatch(fetchBudgetSummary());
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const incomeCategories = categories.filter(cat => cat.type === 'Income');
  const expenseCategories = categories.filter(cat => cat.type === 'Expense');
  const currentCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ➕ Thêm Giao Dịch
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ghi lại thu nhập hoặc chi tiêu của bạn
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Transaction Type & Amount Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại giao dịch</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại giao dịch"
                  onChange={(e) => {
                    handleChange('type', e.target.value);
                    handleChange('categoryId', ''); // Reset category when type changes
                  }}
                >
                  <MenuItem value="Expense">Chi tiêu</MenuItem>
                  <MenuItem value="Income">Thu nhập</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tiền"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      VND
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Date */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Ngày giao dịch"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleChange('transactionDate', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Category Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={formData.categoryId}
                label="Danh mục"
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                {currentCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả chi tiết giao dịch..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Description color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Tags */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Tags (tùy chọn)"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Ví dụ: ăn trưa, công việc, gia đình"
              helperText="Phân cách các tag bằng dấu phẩy"
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Save />}
              disabled={transactionLoading || !formData.categoryId || !formData.amount}
              sx={{ px: 4, py: 1.5 }}
            >
              {transactionLoading ? 'Đang lưu...' : 'Lưu Giao Dịch'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Cancel />}
              onClick={handleCancel}
              sx={{ px: 4, py: 1.5 }}
            >
              Hủy
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddTransactionPage;