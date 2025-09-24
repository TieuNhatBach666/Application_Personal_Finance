import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  IconButton,
  Chip,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';
import { CategoryForm } from '../../types';
import { useUserSettings } from '../../hooks/useUserSettings';

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: categories, loading, error } = useAppSelector((state) => state.categories);
  const { getText } = useUserSettings();
  
  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    type: 'Expense',
    icon: '📝',
    color: '#3498db',
  });

  // Predefined icons for categories
  const iconOptions = [
    '🍕', '🚗', '📚', '🎮', '💊', '🏠', '⚡', '📱',
    '👕', '🎬', '✈️', '🏋️', '🎵', '🛒', '💰', '📊',
    '🎯', '🔧', '🌟', '❤️', '🎨', '📝', '💡', '🔥'
  ];

  const colorOptions = [
    '#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#2ecc71', '#8e44ad'
  ];

  // ========== Chuẩn hóa ICON (tránh text tràn) ==========
  const isEmoji = (str: string) => {
    try {
      return /\p{Extended_Pictographic}/u.test(str);
    } catch {
      return false;
    }
  };

  const iconMap: Record<string, string> = {
    investment: '📈',
    salary: '💰',
    business: '🏢',
    other: '✨',
    allowance: '💳',
    bonus: '🎁',
    food: '🍕',
    transport: '🚗',
    education: '📚',
    entertainment: '🎮',
    shopping: '🛍️',
    bills: '🧾',
    housing: '🏠',
    clothing: '👕',
    healthcare: '💊'
  };

  const getDisplayIcon = (icon: string, name: string, type: string) => {
    if (icon && isEmoji(icon)) return icon;
    const key = (icon || name || '').toLowerCase().trim();
    if (iconMap[key]) return iconMap[key];
    return type === 'Income' ? '📈' : '💸';
  };

  useEffect(() => {
    dispatch(fetchCategories());
    setIsVisible(true);
  }, [dispatch]);

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category.id);
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'Expense',
        icon: '📝',
        color: '#3498db',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'Expense',
      icon: '📝',
      color: '#3498db',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory, data: formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  // Fix encoding issues with Vietnamese text
  const fixVietnameseText = (text: string) => {
    try {
      // Try to decode if it's double-encoded
      let fixed = text;
      
      // Manual mapping for common Vietnamese words
      const vietnameseMap: { [key: string]: string } = {
        'LÆ°Æ¡ng': 'Lương',
        'Ă°n uá»ng': 'Ăn uống',
        'Äi láº¡i': 'Đi lại',
        'Há»c táº­p': 'Học tập',
        'Giáº£i trÃ­': 'Giải trí',
        'Phá»¥ cáº¥p': 'Phụ cấp',
        'Thá»©áº¯ng': 'Thưởng',
        'Thu nháº­p khác': 'Thu nhập khác',
        'Chi tiêu khác': 'Chi tiêu khác',
        'Mua sáº¯m': 'Mua sắm',
        'Há»a Äá»n': 'Hóa đơn',
        'Nhà á»Ÿ': 'Nhà ở',
        'Quáº§n Ã¡o': 'Quần áo',
        'Kinh doanh': 'Kinh doanh',
        'Äáº§u tÆ°': 'Đầu tư',
        'investment': 'Đầu tư',
        'business': 'Kinh doanh',
        'salary': 'Lương',
        'allowance': 'Phụ cấp',
        'bonus': 'Thưởng',
        'other': 'Khác',
        'food': 'Ăn uống',
        'transport': 'Đi lại',
        'education': 'Học tập',
        'entertainment': 'Giải trí',
        'shopping': 'Mua sắm',
        'bills': 'Hóa đơn',
        'housing': 'Nhà ở',
        'clothing': 'Quần áo',
        'healthcare': 'Y tế'
      };

      // Apply mappings
      for (const [key, value] of Object.entries(vietnameseMap)) {
        fixed = fixed.replace(new RegExp(key, 'gi'), value);
      }

      return fixed;
    } catch (error) {
      return text; // Return original if fixing fails
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'Income');
  const expenseCategories = categories.filter(cat => cat.type === 'Expense');

  const CategoryCard = ({ category, index }: { category: any; index: number }) => (
    <Grow in={isVisible} timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card
        sx={{
          height: { xs: 'auto', sm: '100%' },
          minHeight: { xs: '280px', sm: '300px', md: '280px' },
          background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
          border: `1px solid ${category.color}30`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px ${category.color}20`,
            border: `1px solid ${category.color}60`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${category.color} 0%, ${category.color}80 100%)`,
          },
        }}
      >
        <CardContent sx={{ 
          p: { xs: 2, sm: 3 }, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flex: 1,
          gap: 1,
        }}>
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            gap: { xs: 0.5, sm: 1 },
            width: '100%',
            px: 1,
          }}>
            {/* Icon container: giới hạn chiều cao & ẩn tràn để text không vỡ layout */}
            <Box sx={{
              height: { xs: 48, sm: 56 },
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {(() => {
                const displayIcon = getDisplayIcon(category.icon, category.name, category.type);
                return (
                  <Typography
                    component="div"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem' },
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      maxWidth: '100%',
                    }}
                  >
                    {displayIcon}
                  </Typography>
                );
              })()}
            </Box>
            
            <Box
              component="div"
              title={fixVietnameseText(category.name)}
              sx={{
                fontWeight: 600,
                color: category.color,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontSize: { xs: '14px', sm: '15px', md: '16px' },
                textAlign: 'center',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                lineHeight: '1.4',
                padding: '4px 8px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                whiteSpace: 'normal',
                display: 'block',
              }}
            >
              {fixVietnameseText(category.name)}
            </Box>
            
            <Chip
              icon={category.type === 'Income' ? <TrendingUp /> : <TrendingDown />}
              label={category.type === 'Income' ? getText('incomeType') : getText('expenseType')}
              color={category.type === 'Income' ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto' }}>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(category)}
              sx={{
                color: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(52, 152, 219, 0.2)',
                },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(category.id)}
              sx={{
                color: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(231, 76, 60, 0.2)',
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
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
              📂 {getText('categoriesTitle')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getText('categoriesSubtitle')}
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
            {getText('addCategory')}
          </Button>
        </Box>
      </Fade>

      {/* Income Categories */}
      <Slide direction="up" in={isVisible} timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#27ae60',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUp /> {getText('incomeCategories')} ({incomeCategories.length})
          </Typography>
          
          <Grid container spacing={3}>
            {incomeCategories.map((category, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={category.id}>
                <CategoryCard category={category} index={index} />
              </Grid>
            ))}
            {incomeCategories.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <Typography color="text.secondary">
                    {getText('noIncomeCategories')}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Slide>

      {/* Expense Categories */}
      <Slide direction="up" in={isVisible} timeout={1200}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#e74c3c',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingDown /> {getText('expenseCategories')} ({expenseCategories.length})
          </Typography>
          
          <Grid container spacing={3}>
            {expenseCategories.map((category, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={category.id}>
                <CategoryCard category={category} index={index} />
              </Grid>
            ))}
            {expenseCategories.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <Typography color="text.secondary">
                    {getText('noExpenseCategories')}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Slide>

      {/* Add/Edit Category Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? getText('editCategory') : getText('addNewCategory')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên danh mục"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{getText('categoryTypeLabel')}</InputLabel>
              <Select
                value={formData.type}
                label={getText('categoryTypeLabel')}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'Income' | 'Expense' }))}
              >
                <MenuItem value="Income">{getText('incomeType')}</MenuItem>
                <MenuItem value="Expense">{getText('expenseType')}</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Chọn biểu tượng:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {iconOptions.map((icon) => (
                <Button
                  key={icon}
                  variant={formData.icon === icon ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  sx={{ minWidth: 50, height: 50, fontSize: '1.5rem' }}
                >
                  {icon}
                </Button>
              ))}
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Chọn màu sắc:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <Button
                  key={color}
                  variant={formData.color === color ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    backgroundColor: color,
                    border: formData.color === color ? `3px solid ${color}` : `1px solid ${color}`,
                    '&:hover': {
                      backgroundColor: color,
                      opacity: 0.8,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Cancel />}
            sx={{ textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name.trim() || loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;