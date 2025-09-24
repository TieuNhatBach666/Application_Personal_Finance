import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  TrendingDown,
  BarChart,
  AccountBalance,
  Notifications,
  Settings,
  Category,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

interface SidebarProps {
  drawerWidth: number;
}

const menuItems = [
  {
    text: 'Tổng quan',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    text: 'Thu nhập',
    icon: <TrendingUp />,
    path: '/income',
  },
  {
    text: 'Chi tiêu',
    icon: <TrendingDown />,
    path: '/expenses',
  },
  {
    text: 'Danh mục',
    icon: <Category />,
    path: '/categories',
  },
  {
    text: 'Thống kê',
    icon: <BarChart />,
    path: '/statistics',
  },
  {
    text: 'Ngân sách',
    icon: <AccountBalance />,
    path: '/budget',
  },
  {
    text: 'Cảnh báo',
    icon: <Notifications />,
    path: '/notifications',
  },
  {
    text: 'Cài đặt',
    icon: <Settings />,
    path: '/settings',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap component="div" color="primary">
            💰 Finance
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: sidebarOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create('transform', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
        open={sidebarOpen}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;