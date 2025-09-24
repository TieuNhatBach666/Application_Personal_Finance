import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface LineChartProps {
    data: {
        name: string;
        amount: number;
        percentage: number;
        color: string;
        icon?: string;
    }[];
    title?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
    const chartRef = useRef<ChartJS<'line'>>(null);

    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                label: 'Chi tiêu theo thời gian',
                data: data.map(item => item.amount),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#2980b9',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
        elements: {
            line: {
                borderJoinStyle: 'round',
                borderCapStyle: 'round',
            },
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
                <Box sx={{ fontSize: '3rem' }}>📈</Box>
                <Box sx={{ textAlign: 'center' }}>
                    Không có dữ liệu để hiển thị
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 300, position: 'relative' }}>
            <Line ref={chartRef} data={chartData} options={options} />
        </Box>
    );
};

export default LineChart;