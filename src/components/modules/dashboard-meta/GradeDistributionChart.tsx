"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IChartDataPoint } from "@/service/dashboard/dashboard.service";

interface Props {
    data: IChartDataPoint[];
}

export function GradeDistributionChart({ data }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>

            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="label" />

                        <YAxis allowDecimals={false} />

                        <Tooltip />

                        <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            fill="#2563eb"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}