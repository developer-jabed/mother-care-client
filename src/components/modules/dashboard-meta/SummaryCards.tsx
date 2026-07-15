"use client";

import {
    GraduationCap,
    Users,
    Layers,
    BookOpen,
    FileCheck2,
    ClipboardCheck,
    ShieldCheck,
} from "lucide-react";
import type { ISummaryCard } from "@/service/dashboard/dashboard.service";

/**
 * Ledger-stamp card: every card carries a small rotated gold "seal" in the
 * corner — the same motif as the header's soft gold blur — so the summary
 * strip reads like a stamped report-card cover sheet rather than a generic
 * stat-grid.
 */
function Seal({ Icon }: { Icon: React.ElementType }) {
    return (
        <div className="pointer-events-none absolute -right-3 -top-3 flex h-14 w-14 rotate-[14deg] items-center justify-center rounded-full border-2 border-dashed border-[#C9992D]/40 bg-[#C9992D]/10 transition-transform duration-500 group-hover:rotate-0">
            <Icon className="h-5 w-5 text-[#C9992D]" strokeWidth={2.2} />
        </div>
    );
}

function ProgressRail({ value, total }: { value: number; total: number }) {
    const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
    return (
        <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9992D] to-[#e3b94f] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                {value.toLocaleString("bn-BD")} / {total.toLocaleString("bn-BD")} প্রকাশিত ({pct}%)
            </p>
        </div>
    );
}

function StatCard({
    label,
    value,
    sub,
    icon,
    accent,
    children,
}: {
    label: string;
    value: number;
    sub?: string;
    icon: React.ElementType;
    accent: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(23,33,66,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_rgba(23,33,66,0.22)]">
            {/* top hairline accent, echoes the header's gold divider */}
            <div
                className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                style={{ background: accent }}
            />
            <Seal Icon={icon} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
            </p>
            <p className="mt-2 font-mono text-[2rem] font-bold leading-none tracking-tight text-[#172142] tabular-nums">
                {value.toLocaleString("bn-BD")}
            </p>
            {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
            {children}
        </div>
    );
}

export function SummaryCards({ summary }: { summary: ISummaryCard }) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                label="মোট শিক্ষার্থী"
                value={summary.totalStudents}
                sub="সক্রিয় ভর্তিকৃত শিক্ষার্থী"
                icon={GraduationCap}
                accent="linear-gradient(90deg,#C9992D,#e3b94f)"
            />

            <StatCard
                label="মোট শিক্ষক"
                value={summary.totalTeachers}
                sub="নিয়োজিত শিক্ষকমণ্ডলী"
                icon={Users}
                accent="linear-gradient(90deg,#172142,#2A3A6B)"
            />

            <StatCard
                label="সিস্টেম ইউজার"
                value={summary.totalUsers}
                sub={`${summary.totalAdmins.toLocaleString("bn-BD")} জন অ্যাডমিন`}
                icon={ShieldCheck}
                accent="linear-gradient(90deg,#2A3A6B,#C9992D)"
            />

            <StatCard
                label="শ্রেণি ও শাখা"
                value={summary.totalClasses}
                sub={`${summary.totalSections.toLocaleString("bn-BD")}টি শাখা`}
                icon={Layers}
                accent="linear-gradient(90deg,#C9992D,#172142)"
            />

            <StatCard
                label="বিষয়সমূহ"
                value={summary.totalSubjects}
                sub="কারিকুলামভুক্ত মোট বিষয়"
                icon={BookOpen}
                accent="linear-gradient(90deg,#172142,#C9992D)"
            />

            <StatCard
                label="পরীক্ষা"
                value={summary.totalExams}
                icon={ClipboardCheck}
                accent="linear-gradient(90deg,#2A3A6B,#e3b94f)"
            >
                <ProgressRail value={summary.publishedExams} total={summary.totalExams} />
            </StatCard>

            <StatCard
                label="ফলাফল"
                value={summary.totalResults}
                icon={FileCheck2}
                accent="linear-gradient(90deg,#C9992D,#172142)"
            >
                <ProgressRail value={summary.publishedResults} total={summary.totalResults} />
            </StatCard>
        </div>
    );
}