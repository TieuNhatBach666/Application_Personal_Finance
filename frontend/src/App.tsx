import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import { fetchSettings } from './store/slices/settingsSlice';

// Components
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AddTransactionPage from './pages/Transactions/AddTransactionPage';
import TransactionListPage from './pages/Transactions/TransactionListPage';
import CategoriesPage from './pages/Categories/CategoriesPage';
import StatisticsPage from './pages/Statistics/StatisticsPage';
import BudgetPage from './pages/Budget/BudgetPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';


// Create theme based on user settings
const createAppTheme = (themeMode: string) => {
  const isDark = themeMode === 'dark' || (themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#3498db',
      },
      secondary: {
        main: '#2c3e50',
      },
      background: {
        default: isDark ? '#121212' : '#f8f9fa',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
  });
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// App Content Component
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const { settings } = useAppSelector((state) => state.settings);

  // Create theme based on user settings
  const theme = useMemo(() => {
    const themeMode = settings?.appearance?.theme || 'light';
    console.log('🎨 Theme Debug:', { settings, themeMode });
    return createAppTheme(themeMode);
  }, [settings?.appearance?.theme]);

  useEffect(() => {
    // If we have a token but no user data, fetch current user
    if (accessToken && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, accessToken, isAuthenticated]);

  useEffect(() => {
    // Fetch settings when user is authenticated
    if (isAuthenticated) {
      dispatch(fetchSettings());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Transaction Routes */}
          <Route
            path="/transactions/add"
            element={
              <ProtectedRoute>
                <AddTransactionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <TransactionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <TransactionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />


          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
