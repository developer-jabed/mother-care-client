"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Users2 } from "lucide-react";
import type { IChartDataPoint } from "@/service/dashboard/dashboard.service";

function EnrollmentTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-100 bg-[#172142] px-4 py-2.5 text-white shadow-xl">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                {label}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-[#e3b94f]">
                {payload[0].value.toLocaleString("bn-BD")} জন
            </p>
        </div>
    );
}

export function EnrollmentChart({ data }: { data: IChartDataPoint[] }) {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const busiest = data.reduce(
        (max, d) => (d.value > max.value ? d : max),
        data[0] ?? { label: "-", value: 0 }
    );

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(23,33,66,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172142]/5">
                            <Users2 className="h-4 w-4 text-[#172142]" />
                        </span>
                        <h2 className="text-base font-semibold text-[#172142]">
                            শ্রেণিভিত্তিক ভর্তির চিত্র
                        </h2>
                    </div>
                    <p className="mt-1 pl-10 text-xs text-slate-400">
                        মোট {total.toLocaleString("bn-BD")} জন শিক্ষার্থী · সর্বোচ্চ ভর্তি {busiest.label}
                    </p>
                </div>
                <span className="rounded-full border border-[#C9992D]/30 bg-[#C9992D]/10 px-3 py-1 text-[11px] font-semibold text-[#a97e1e]">
                    চলতি শিক্ষাবর্ষ
                </span>
            </div>

            <div className="mt-6 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                            <linearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2A3A6B" />
                                <stop offset="100%" stopColor="#172142" />
                            </linearGradient>
                            <linearGradient id="enrollmentFillActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e3b94f" />
                                <stop offset="100%" stopColor="#C9992D" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#EEF0F6" strokeDasharray="4 6" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#94A3B8", fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#94A3B8", fontSize: 12 }}
                            width={36}
                        />
                        <Tooltip cursor={{ fill: "#172142", fillOpacity: 0.04 }} content={<EnrollmentTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={46} animationDuration={900}>
                            {data.map((entry) => (
                                <Cell
                                    key={entry.label}
                                    fill={
                                        entry.label === busiest.label
                                            ? "url(#enrollmentFillActive)"
                                            : "url(#enrollmentFill)"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}