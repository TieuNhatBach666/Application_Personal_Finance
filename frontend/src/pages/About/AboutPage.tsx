import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Fade,
  Slide,
  Zoom,
  Container,
  Stack,
} from '@mui/material';
import {
  Code,
  Dashboard,
  Storage,
  Palette,
  Security,
  Speed,
  Psychology,
  EmojiEvents,
  GitHub,
  Email,
  LinkedIn,
  Language,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const techStack = [
    { name: 'React', icon: '⚛️', color: '#61DAFB' },
    { name: 'TypeScript', icon: '📘', color: '#3178C6' },
    { name: 'Node.js', icon: '🟢', color: '#339933' },
    { name: 'SQL Server', icon: '🗄️', color: '#CC2927' },
    { name: 'Material-UI', icon: '🎨', color: '#007FFF' },
    { name: 'Redux Toolkit', icon: '🔧', color: '#764ABC' },
  ];

  const features = [
    { icon: <Dashboard />, title: 'Dashboard Trực Quan', desc: 'Theo dõi tài chính realtime' },
    { icon: <Storage />, title: 'Quản Lý Giao Dịch', desc: 'Thêm, sửa, xóa dễ dàng' },
    { icon: <Palette />, title: 'Giao Diện Đẹp', desc: 'Hiện đại & thân thiện' },
    { icon: <Security />, title: 'Bảo Mật Cao', desc: 'JWT Authentication' },
    { icon: <Speed />, title: 'Hiệu Năng Tốt', desc: 'Tối ưu & nhanh chóng' },
    { icon: <Psychology />, title: 'AI Insights', desc: 'Gợi ý thông minh' },
  ];

  const timeline = [
    { phase: 'Giai Đoạn 1', title: 'Phân Tích & Thiết Kế', person: 'Tiểu Nhất Bạch', date: 'Tuần 1-2' },
    { phase: 'Giai Đoạn 2', title: 'Database & Backend API', person: 'Tiểu Nhất Bạch', date: 'Tuần 3-4' },
    { phase: 'Giai Đoạn 3', title: 'Frontend UI/UX', person: 'Tiểu Nhất Bạch', date: 'Tuần 5-6' },
    { phase: 'Giai Đoạn 4', title: 'Tích Hợp & Testing', person: 'Tiểu Nhất Bạch', date: 'Tuần 7-8' },
    { phase: 'Giai Đoạn 5', title: 'Hoàn Thiện & Deploy', person: 'Tiểu Nhất Bạch', date: 'Tuần 9-10' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in={isVisible} timeout={1000}>
          <Paper
            sx={{
              p: 6,
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.1,
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                💰 Personal Finance Manager
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 3 }}>
                Ứng Dụng Quản Lý Tài Chính Cá Nhân Thông Minh
              </Typography>
              <Chip
                label="Version 1.0.0"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 2.5,
                }}
              />
            </Box>
          </Paper>
        </Fade>

        <Grid container spacing={4}>
          {/* Thông tin tác giả */}
          <Grid item xs={12} md={4}>
            <Slide direction="right" in={isVisible} timeout={1200}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  height: '100%',
                }}
              >
                <Zoom in={isVisible} timeout={1500}>
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      mx: 'auto',
                      mb: 3,
                      fontSize: '4rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    👨‍💻
                  </Avatar>
                </Zoom>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Tiểu Nhất Bạch
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Full-Stack Developer
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Chip
                    icon={<GitHub />}
                    label="TieuNhatBach666"
                    sx={{ justifyContent: 'flex-start' }}
                  />
                  <Chip
                    icon={<Email />}
                    label="tieunhatbach@dev.com"
                    sx={{ justifyContent: 'flex-start' }}
                  />
                  <Chip
                    icon={<Language />}
                    label="Vietnam"
                    sx={{ justifyContent: 'flex-start' }}
                  />
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Vai Trò Trong Dự Án
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip label="Project Lead" color="primary" size="small" />
                    <Chip label="Backend Dev" color="secondary" size="small" />
                    <Chip label="Frontend Dev" color="success" size="small" />
                    <Chip label="UI/UX Design" color="warning" size="small" />
                    <Chip label="Database Admin" color="info" size="small" />
                  </Box>
                </Box>
              </Paper>
            </Slide>
          </Grid>

          {/* Tính năng chính */}
          <Grid item xs={12} md={8}>
            <Slide direction="left" in={isVisible} timeout={1200}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents sx={{ color: '#FFD700' }} />
                  Tính Năng Nổi Bật
                </Typography>

                <Grid container spacing={2}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Zoom in={isVisible} timeout={1000 + index * 200}>
                        <Card
                          sx={{
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                            },
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  display: 'flex',
                                }}
                              >
                                {feature.icon}
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {feature.title}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {feature.desc}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Slide>
          </Grid>

          {/* Tech Stack */}
          <Grid item xs={12}>
            <Fade in={isVisible} timeout={1800}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code />
                  Công Nghệ Sử Dụng
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {techStack.map((tech, index) => (
                    <Zoom in={isVisible} timeout={1500 + index * 100} key={index}>
                      <Chip
                        icon={<span style={{ fontSize: '1.5rem' }}>{tech.icon}</span>}
                        label={tech.name}
                        sx={{
                          px: 2,
                          py: 3,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderColor: tech.color,
                          '&:hover': {
                            backgroundColor: tech.color,
                            color: 'white',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s',
                        }}
                        variant="outlined"
                      />
                    </Zoom>
                  ))}
                </Box>
              </Paper>
            </Fade>
          </Grid>

          {/* Timeline phát triển */}
          <Grid item xs={12}>
            <Fade in={isVisible} timeout={2000}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🗓️ Quy Trình Phát Triển
                </Typography>

                <Stack spacing={3}>
                  {timeline.map((item, index) => (
                    <Zoom in={isVisible} timeout={1800 + index * 100} key={index}>
                      <Card
                        sx={{
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateX(10px)',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                          },
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontWeight: 700,
                                }}
                              >
                                {index + 1}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  👤 Phụ trách: {item.person}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip label={item.phase} color="primary" size="small" sx={{ mb: 0.5 }} />
                              <Typography variant="caption" display="block" color="text.secondary">
                                {item.date}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  ))}
                </Stack>
              </Paper>
            </Fade>
          </Grid>

          {/* Footer */}
          <Grid item xs={12}>
            <Fade in={isVisible} timeout={2200}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📜 Bản Quyền
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  © 2025 Tiểu Nhất Bạch. All Rights Reserved.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đồ Án Kết Thúc Môn - Quản Lý Tài Chính Cá Nhân
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutPage;
