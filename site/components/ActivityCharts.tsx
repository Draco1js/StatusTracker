'use client'

import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface ActivityChartsProps {
    activities: Activity[];
}

export default function ActivityCharts({ activities }: ActivityChartsProps) {
    const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
    ];

    const barChartData = {
        labels: activities.map(a => a.name),
        datasets: [
            {
                label: 'Duration (hours)',
                data: activities.map(a => a.duration / (1000 * 60 * 60)),
                backgroundColor: colors,
            },
        ],
    };

    const doughnutChartData = {
        labels: activities.map(a => a.name),
        datasets: [
            {
                data: activities.map(a => a.duration),
                backgroundColor: colors,
            },
        ],
    };

    const lineChartData = {
        labels: activities.map(a => a.name),
        datasets: [
            {
                label: 'Times Played',
                data: activities.map(a => a.timesPlayed || 0),
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <Card className="bg-white shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Activity Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bar">Duration</TabsTrigger>
                        <TabsTrigger value="doughnut">Distribution</TabsTrigger>
                        <TabsTrigger value="line">Engagement</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bar">
                        <div className="h-[400px]">
                            <Bar options={chartOptions} data={barChartData} />
                        </div>
                    </TabsContent>
                    <TabsContent value="doughnut">
                        <div className="h-[400px]">
                            <Doughnut options={chartOptions} data={doughnutChartData} />
                        </div>
                    </TabsContent>
                    <TabsContent value="line">
                        <div className="h-[400px]">
                            <Line options={chartOptions} data={lineChartData} />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}