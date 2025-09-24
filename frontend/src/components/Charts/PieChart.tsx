import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
    data: {
        name: string;
        amount: number;
        percentage: number;
        color: string;
        icon?: string;
    }[];
    title?: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const chartRef = useRef<ChartJS<'pie'>>(null);

    const chartData = {
        labels: data.map(item => item.name),
        datasets: [
            {
                data: data.map(item => item.amount),
                backgroundColor: data.map(item => item.color),
                borderColor: data.map(item => item.color),
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 10,
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    generateLabels: (chart) => {
                        const datasets = chart.data.datasets;
                        if (datasets.length) {
                            return chart.data.labels?.map((label, i) => {
                                const dataset = datasets[0];
                                const value = dataset.data[i] as number;
                                const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: dataset.backgroundColor?.[i] as string,
                                    strokeStyle: dataset.borderColor?.[i] as string,
                                    lineWidth: dataset.borderWidth as number,
                                    hidden: false,
                                    index: i,
                                };
                            }) || [];
                        }
                        return [];
                    },
                },
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
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        
                        return [
                            `${label}`,
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
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
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
            <Pie ref={chartRef} data={chartData} options={options} />
        </Box>
    );
};

export default PieChart;