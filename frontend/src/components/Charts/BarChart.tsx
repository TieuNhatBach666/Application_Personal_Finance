import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BarChartProps {
    data: {
        name: string;
        amount: number;
        percentage: number;
        color: string;
        icon?: string;
    }[];
    title?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    const chartRef = useRef<ChartJS<'bar'>>(null);

    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Chi tiêu (VND)',
                data: data.map(item => item.amount),
                backgroundColor: data.map(item => `${item.color}80`), // 50% opacity
                borderColor: data.map(item => item.color),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: data.map(item => `${item.color}CC`), // 80% opacity
                hoverBorderColor: data.map(item => item.color),
                hoverBorderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hide legend for bar chart
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        
                        return [
                            `Số tiền: ${new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            }).format(value)}`,
                            `Tỷ lệ: ${percentage}%`
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    color: '#666',
                    maxRotation: 45,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#666',
                    callback: function(value) {
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            notation: 'compact',
                            maximumFractionDigits: 1,
                        }).format(value as number);
                    },
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart',
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    useEffect(() => {
        const chart = chartRef.current;
        if (chart) {
            chart.update();
        }
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Box
                sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    color: 'text.secondary',
                }}
            >
                <Box sx={{ fontSize: '3rem' }}>📊</Box>
                <Box sx={{ textAlign: 'center' }}>
                    Không có dữ liệu để hiển thị
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 300, position: 'relative' }}>
            <Bar ref={chartRef} data={chartData} options={options} />
        </Box>
    );
};

export default BarChart;