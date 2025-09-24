import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#27ae60',
      light: '#58d68d',
      dark: '#1e8449',
    },
    warning: {
      main: '#f39c12',
      light: '#f8c471',
      dark: '#d68910',
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
    },
    divider: '#404040',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#ffffff',
    },
    h2: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h3: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 500,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      color: '#ffffff',
    },
    body2: {
      color: '#b0b0b0',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid #404040',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          borderRadius: 12,
          border: '1px solid #404040',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(52, 152, 219, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#3d3d3d',
            '& fieldset': {
              borderColor: '#555555',
            },
            '&:hover fieldset': {
              borderColor: '#777777',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3498db',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#b0b0b0',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2d2d2d',
          borderRight: '1px solid #404040',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          borderBottom: '1px solid #404040',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#404040',
          },
          '&.Mui-selected': {
            backgroundColor: '#3498db20',
            '&:hover': {
              backgroundColor: '#3498db30',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#404040',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#555555',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: '#4d1f1f',
          color: '#ffffff',
          border: '1px solid #e74c3c',
        },
        standardWarning: {
          backgroundColor: '#4d3d1f',
          color: '#ffffff',
          border: '1px solid #f39c12',
        },
        standardInfo: {
          backgroundColor: '#1f3d4d',
          color: '#ffffff',
          border: '1px solid #3498db',
        },
        standardSuccess: {
          backgroundColor: '#1f4d2f',
          color: '#ffffff',
          border: '1px solid #27ae60',
        },
      },
    },
  },
});

export default darkTheme;
