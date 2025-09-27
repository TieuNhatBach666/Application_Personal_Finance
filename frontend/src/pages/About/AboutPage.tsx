import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Code,
  Palette,
  School,
  CalendarToday,
  Person,
  Copyright,
  Star,
  GitHub,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Favorite,
  EmojiEvents,
  Timeline,
  AutoAwesome,
} from '@mui/icons-material';
import { useUserSettings } from '../../hooks/useUserSettings';

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { getText } = useUserSettings();
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      name: 'Tiểu Nhất Bạch',
      role: 'Người Phụ Trách Thiết Kế Giao Diện',
      icon: <Palette />,
      color: '#e74c3c',
      description: 'Chuyên về UI/UX Design, tạo ra những giao diện đẹp mắt và thân thiện với người dùng'
    },
    {
      name: 'Tiểu Nhất Bạch',
      role: 'Người Phụ Trách Viết Code',
      icon: <Code />,
      color: '#3498db',
      description: 'Phát triển backend và frontend, đảm bảo hiệu suất và bảo mật của ứng dụng'
    },
    {
      name: 'Tiểu Nhất Bạch',
      role: 'Người Phụ Trách Quản Lý Dự Án',
      icon: <EmojiEvents />,
      color: '#f39c12',
      description: 'Điều phối dự án, đảm bảo tiến độ và chất lượng sản phẩm'
    },
    {
      name: 'Tiểu Nhất Bạch',
      role: 'Người Phụ Trách Kiểm Thử',
      icon: <AutoAwesome />,
      color: '#9b59b6',
      description: 'Đảm bảo chất lượng phần mềm thông qua các quy trình kiểm thử chặt chẽ'
    }
  ];

  const projectInfo = {
    name: 'Personal Finance Manager',
    version: '1.0.0',
    foundingDate: '27/09/2025',
    studentId: '533312410124',
    technologies: ['React', 'TypeScript', 'Node.js', 'SQL Server', 'Material-UI'],
    features: ['Quản lý giao dịch', 'Thống kê chi tiêu', 'Ngân sách', 'Báo cáo', 'Sao lưu dữ liệu']
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '100vh' }}>
        {/* Header Section */}
        <Fade in={isVisible} timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Personal Finance Manager
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                fontWeight: 300,
                mb: 4
              }}
            >
              Ứng dụng quản lý tài chính cá nhân thông minh
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {projectInfo.technologies.map((tech, index) => (
                <Zoom in={isVisible} timeout={1000 + index * 200} key={tech}>
                  <Chip
                    label={tech}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s'
                      }
                    }}
                  />
                </Zoom>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Project Info Section */}
        <Slide direction="up" in={isVisible} timeout={1200}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                textAlign: 'center'
              }}
            >
              📋 Thông Tin Dự Án
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ color: '#e74c3c', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Ngày Thành Lập
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                      {projectInfo.foundingDate}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <School sx={{ color: '#3498db', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Mã Số Sinh Viên
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#3498db' }}>
                      {projectInfo.studentId}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Star sx={{ color: '#f39c12', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Phiên Bản
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f39c12' }}>
                      {projectInfo.version}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Timeline sx={{ color: '#9b59b6', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Trạng Thái
                      </Typography>
                    </Box>
                    <Chip
                      label="Hoàn Thành"
                      sx={{
                        background: 'linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        px: 2
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Slide>

        {/* Team Section */}
        <Slide direction="up" in={isVisible} timeout={1400}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                textAlign: 'center'
              }}
            >
              👥 Đội Ngũ Phát Triển
            </Typography>

            <Grid container spacing={3}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Zoom in={isVisible} timeout={1500 + index * 200}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            mb: 2,
                            background: `linear-gradient(45deg, ${member.color} 0%, ${member.color}aa 100%)`,
                            fontSize: '2rem'
                          }}
                        >
                          {member.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {member.name}
                        </Typography>
                        <Chip
                          label={member.role}
                          sx={{
                            background: `linear-gradient(45deg, ${member.color} 0%, ${member.color}aa 100%)`,
                            color: 'white',
                            fontWeight: 600,
                            mb: 2
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          {member.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Slide>

        {/* Features Section */}
        <Slide direction="up" in={isVisible} timeout={1600}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                textAlign: 'center'
              }}
            >
              ⚡ Tính Năng Chính
            </Typography>

            <Grid container spacing={2}>
              {projectInfo.features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={feature}>
                  <Zoom in={isVisible} timeout={1700 + index * 100}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {feature}
                      </Typography>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Slide>

        {/* Copyright Section */}
        <Fade in={isVisible} timeout={2000}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Copyright sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Bản Quyền Tác Giả
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              © 2025 Tiểu Nhất Bạch
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Tất cả quyền được bảo lưu. Phần mềm này được phát triển cho mục đích học tập và nghiên cứu.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip
                icon={<Favorite />}
                label="Made with Love"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<School />}
                label="Đồ Án Kết Thúc Môn"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default AboutPage;
