# Personal Finance Frontend

## Overview
React + TypeScript frontend for Personal Finance Manager with Material-UI design system.

## Features
- ✅ Modern React 18 with TypeScript
- ✅ Material-UI (MUI) components and theming
- ✅ Redux Toolkit for state management
- ✅ React Router for navigation
- ✅ Responsive design for desktop
- ✅ Authentication system (login/register)
- ✅ Protected routes
- ✅ API integration with backend

## Tech Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── MainLayout.tsx      # Main app layout
│   │       ├── Header.tsx          # Top navigation bar
│   │       └── Sidebar.tsx         # Side navigation menu
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx       # Login form
│   │   │   └── RegisterPage.tsx    # Registration form
│   │   └── Dashboard/
│   │       └── DashboardPage.tsx   # Main dashboard
│   ├── store/
│   │   ├── index.ts                # Redux store configuration
│   │   └── slices/
│   │       ├── authSlice.ts        # Authentication state
│   │       ├── categorySlice.ts    # Category management
│   │       └── uiSlice.ts          # UI state (sidebar, theme)
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── config/
│   │   └── api.ts                  # API configuration and endpoints
│   └── App.tsx                     # Main app component
├── .env                            # Environment variables
└── package.json                    # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Implemented

### Authentication System
- **Login Page** - Email/password authentication
- **Register Page** - User registration with validation
- **Protected Routes** - Automatic redirect to login for unauthenticated users
- **JWT Token Management** - Automatic token handling and refresh

### Layout & Navigation
- **Responsive Sidebar** - Collapsible navigation menu
- **Header with User Menu** - User profile and logout functionality
- **Material-UI Theme** - Consistent design system
- **Route-based Navigation** - Active state highlighting

### State Management
- **Redux Toolkit** - Centralized state management
- **Async Thunks** - API call handling with loading states
- **Error Handling** - User-friendly error messages
- **Type Safety** - Full TypeScript integration

### Dashboard
- **Financial Overview** - Income, expense, and savings cards
- **Quick Actions** - Fast access to common operations
- **Statistics Preview** - Placeholder for charts and graphs

## API Integration

The frontend connects to the backend API with the following features:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - User logout

### Category Endpoints
- `GET /categories` - Get all user categories
- `GET /categories/type/:type` - Get categories by type
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Request/Response Handling
- **Automatic Token Injection** - JWT tokens added to requests
- **Error Interceptors** - Automatic logout on 401 errors
- **Loading States** - UI feedback during API calls
- **Type-Safe Responses** - TypeScript interfaces for all API responses

## Component Examples

### Login Form
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  dispatch(loginUser(formData));
};
```

### Protected Route
```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};
```

### API Call with Redux
```typescript
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.BASE
      );
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

## Styling & Theme

### Material-UI Theme
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#2c3e50',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
});
```

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for smaller screens
- Flexible grid layouts
- Touch-friendly interface elements

## Development Guidelines

### Code Organization
- **Components** - Reusable UI components in `components/`
- **Pages** - Route-level components in `pages/`
- **Types** - TypeScript definitions in `types/`
- **Store** - Redux slices and configuration in `store/`

### Naming Conventions
- **Components** - PascalCase (e.g., `LoginPage.tsx`)
- **Files** - camelCase for utilities, PascalCase for components
- **Types** - PascalCase interfaces (e.g., `User`, `Category`)
- **Constants** - UPPER_SNAKE_CASE

### State Management
- Use Redux Toolkit for global state
- Local state with `useState` for component-specific data
- Async operations with `createAsyncThunk`
- Selectors for computed state

## Next Steps

The following features are planned for implementation:

1. **Transaction Management** (Task 5.2, 5.3)
   - Add/edit transaction forms
   - Transaction list with filtering
   - Search and pagination

2. **Category Management** (Task 4.2)
   - Category CRUD interface
   - Icon and color picker
   - Category usage statistics

3. **Statistics & Charts** (Task 6.2, 6.3)
   - Interactive charts with Recharts
   - Financial reports and exports
   - Trend analysis

4. **Budget Management** (Task 7.2)
   - Budget creation and tracking
   - Progress indicators
   - Alert notifications

5. **Advanced Features** (Task 10.1, 10.2)
   - Keyboard shortcuts
   - Advanced search and filtering
   - Performance optimizations

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check backend server is running on port 5000
   - Verify VITE_API_BASE_URL in `.env`
   - Check CORS configuration in backend

2. **Authentication Issues**
   - Clear localStorage if tokens are corrupted
   - Check JWT_SECRET matches between frontend/backend
   - Verify token expiration settings

3. **Build Errors**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors with `npm run lint`
   - Verify all imports are correct

4. **Styling Issues**
   - Check Material-UI theme configuration
   - Verify CSS imports and component props
   - Use browser dev tools for debugging

## Deployment

For production deployment:

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Configure environment**
   - Set production API URL in `.env`
   - Configure CORS in backend for production domain

3. **Deploy static files**
   - Upload `dist/` folder to web server
   - Configure routing for SPA (single-page application)

4. **Test deployment**
   - Verify all routes work correctly
   - Test authentication flow
   - Check API connectivity