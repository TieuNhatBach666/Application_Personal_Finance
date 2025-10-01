import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  Alert,
  CircularProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  AttachMoney,
  Description,
  Category,
  CalendarToday,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTransactionById, updateTransaction } from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { useUserSettings } from '../../hooks/useUserSettings';

const EditTransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { getText } = useUserSettings();
  
  const { items: categories } = useAppSelector((state) => state.categories);
  const { loading, error } = useAppSelector((state) => state.transactions);
  
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    transactionDate: '',
    type: 'Expense' as 'Income' | 'Expense',
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    dispatch(fetchCategories());
    
    if (id) {
      loadTransaction();
    }
  }, [dispatch, id]);

  const loadTransaction = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin giao dịch');
      }
      
      const data = await response.json();
      const transaction = data.data;
      
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        categoryId: transaction.categoryId || '',
        transactionDate: transaction.transactionDate.split('T')[0],
        type: transaction.type,
      });
    } catch (error: any) {
      setFormError(error.message || 'Có lỗi xảy ra khi tải giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.categoryId || !formData.transactionDate) {
      setFormError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setFormError('Số tiền phải lớn hơn 0');
      return;
    }

    try {
      const updateData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        categoryId: formData.categoryId,
        transactionDate: formData.transactionDate,
        type: formData.type,
      };

      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật giao dịch');
      }

      // Navigate back to transaction list
      navigate('/transactions');
    } catch (error: any) {
      setFormError(error.message || 'Có lỗi xảy ra khi cập nhật giao dịch');
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Fade in={isVisible} timeout={800}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/transactions')}
            sx={{ textTransform: 'none' }}
          >
            Quay lại
          </Button>
          <Box>
            <Typography 
              variant="h4" 
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              ✏️ Chỉnh Sửa Giao Dịch
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Cập nhật thông tin giao dịch của bạn
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Form */}
      <Slide direction="up" in={isVisible} timeout={1000}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Transaction Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại giao dịch</InputLabel>
                  <Select
                    value={formData.type}
                    label="Loại giao dịch"
                    onChange={(e) => {
                      handleInputChange('type', e.target.value);
                      handleInputChange('categoryId', ''); // Reset category when type changes
                    }}
                  >
                    <MenuItem value="Income">Thu nhập</MenuItem>
                    <MenuItem value="Expense">Chi tiêu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số tiền"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0, step: 1000 }
                  }}
                  required
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Danh mục"
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Category />
                      </InputAdornment>
                    }
                  >
                    {filteredCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày giao dịch"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả (tùy chọn)"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Nhập mô tả chi tiết về giao dịch..."
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/transactions')}
                    sx={{ px: 4, py: 1.5, textTransform: 'none' }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật giao dịch'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Slide>
    </Box>
  );
};

export default EditTransactionPage;
