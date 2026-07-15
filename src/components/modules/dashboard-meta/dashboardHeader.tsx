import { CalendarDays } from "lucide-react";

export function DashboardHeader({ academicYear }: { academicYear: string | null }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172142] via-[#1E2A52] to-[#2A3A6B] px-8 py-10 text-white shadow-[0_20px_60px_-15px_rgba(23,33,66,0.5)]">
            {/* Signature: a soft gold seal in the corner, echoing a report-card stamp */}
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rotate-12 rounded-full bg-gradient-to-b from-[#C9992D]/40 to-transparent blur-2xl" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-[#C9992D] via-[#C9992D]/30 to-transparent" />

            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#C9992D]">
                মাদার কেয়ার স্কুল অ্যান্ড কলেজ
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
                অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/70">
                স্কুলের সার্বিক তথ্য, শিক্ষার্থী ভর্তি, পরীক্ষা ও ফলাফলের একনজর সারসংক্ষেপ।
            </p>

            {academicYear && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                    <CalendarDays className="h-4 w-4 text-[#C9992D]" />
                    চলতি শিক্ষাবর্ষ: <span className="font-semibold">{academicYear}</span>
                </div>
            )}
        </div>
    );
}