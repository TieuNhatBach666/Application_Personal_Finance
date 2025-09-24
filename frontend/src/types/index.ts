// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  currency: string;
  language: string;
  timezone: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  type: 'Income' | 'Expense';
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: 'Income' | 'Expense';
  description?: string;
  transactionDate: string;
  receiptUrl?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  spent?: number;
  percentage?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface TransactionForm {
  categoryId: string;
  amount: number;
  type: 'Income' | 'Expense';
  description?: string;
  transactionDate: string;
  tags?: string;
}

export interface CategoryForm {
  name: string;
  type: 'Income' | 'Expense';
  icon?: string;
  color?: string;
}

// Statistics types
export interface StatisticsSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  topCategories: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  colorCode: string;
}

// UI State types
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'Income' | 'Expense';
  search?: string;
}