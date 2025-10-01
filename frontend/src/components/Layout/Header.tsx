import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    AccountCircle,
    Logout,
    Settings,
    Notifications,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';

interface HeaderProps {
    drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth }) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { sidebarOpen } = useAppSelector((state) => state.ui);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        handleMenuClose();
    };

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar());
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
                transition: (theme) =>
                    theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    edge="start"
                    onClick={handleToggleSidebar}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    💰 Quản lý Tài chính Cá nhân
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="inherit">
                        <Notifications />
                    </IconButton>

                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        color="inherit"
                    >
                        <Avatar 
                            src={(user as any)?.avatarUrl?.startsWith('data:') ? (user as any).avatarUrl : undefined}
                            sx={{ 
                                width: 32, 
                                height: 32,
                                fontSize: (user as any)?.avatarUrl && !(user as any)?.avatarUrl?.startsWith('data:') ? '1.2rem' : '1rem',
                            }}
                        >
                            {(user as any)?.avatarUrl && !(user as any)?.avatarUrl?.startsWith('data:')
                                ? (user as any).avatarUrl
                                : (user?.firstName?.charAt(0) || 'U')}
                        </Avatar>
                    </IconButton>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem disabled>
                            <Typography variant="subtitle2">
                                {user?.firstName} {user?.lastName}
                            </Typography>
                        </MenuItem>
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleMenuClose}>
                            <Settings sx={{ mr: 1 }} />
                            Cài đặt
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} />
                            Đăng xuất
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;