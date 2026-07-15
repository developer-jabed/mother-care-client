"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    IGenderDistribution,
    ISmsStats,
    IChartDataPoint,
} from "@/service/dashboard/dashboard.service";

interface Props {
    gender: IGenderDistribution;
    sms: ISmsStats;
    resultPublishStatus: {
        published: number;
        unpublished: number;
    };
    roleDistribution: IChartDataPoint[];
}

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
];

export function StatusPanels({
    gender,
    sms,
    resultPublishStatus,
    roleDistribution,
}: Props) {
    const genderData = [
        {
            name: "Male",
            value: gender.male,
        },
        {
            name: "Female",
            value: gender.female,
        },
        {
            name: "Other",
            value: gender.other,
        },
    ];

    const resultData = [
        {
            name: "Published",
            value: resultPublishStatus.published,
        },
        {
            name: "Unpublished",
            value: resultPublishStatus.unpublished,
        },
    ];

    return (
        <div className="space-y-6">

            {/* Gender */}

            <Card>
                <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>

                <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={genderData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={85}
                            >
                                {genderData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Result */}

            <Card>
                <CardHeader>
                    <CardTitle>Result Status</CardTitle>
                </CardHeader>

                <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={resultData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={85}
                            >
                                {resultData.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index]}
                                    />
                                ))}
                            </Pie>

                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* User Roles */}

            <Card>
                <CardHeader>
                    <CardTitle>User Roles</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {roleDistribution.map((role) => (
                        <div
                            key={role.label}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <span>{role.label}</span>

                            <span className="font-semibold">
                                {role.value}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* SMS */}

            <Card>
                <CardHeader>
                    <CardTitle>SMS Statistics</CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-2 gap-4 text-center">

                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                            Sent
                        </p>
                        <p className="text-2xl font-bold">
                            {sms.sent}
                        </p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                            Delivered
                        </p>
                        <p className="text-2xl font-bold">
                            {sms.delivered}
                        </p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                            Pending
                        </p>
                        <p className="text-2xl font-bold">
                            {sms.pending}
                        </p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">
                            Failed
                        </p>
                        <p className="text-2xl font-bold">
                            {sms.failed}
                        </p>
                    </div>

                </CardContent>
            </Card>

        </div>
    );
}