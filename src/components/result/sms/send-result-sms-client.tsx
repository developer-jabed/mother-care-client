"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    queueResultSms,
    type SmsLogItem,
    type SmsLogMeta,
    type SmsLogStatus,
} from "@/service/smsLog/sms.service";
import {
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Search,
    ChevronLeft,
    ChevronRight,
    Inbox,
    AlertCircle,
    Loader2,
    MessageSquareText,
} from "lucide-react";

const STATUS_CONFIG: Record<
    SmsLogStatus,
    {
        label: string;
        icon: typeof Clock;
        ring: string;
        dot: string;
        text: string;
        bg: string;
    }
> = {
    PENDING: {
        label: "অপেক্ষমাণ",
        icon: Clock,
        ring: "ring-amber-200",
        dot: "bg-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-50",
    },
    SENT: {
        label: "পাঠানো হয়েছে",
        icon: Send,
        ring: "ring-blue-200",
        dot: "bg-blue-500",
        text: "text-blue-700",
        bg: "bg-blue-50",
    },
    DELIVERED: {
        label: "ডেলিভার হয়েছে",
        icon: CheckCircle2,
        ring: "ring-emerald-200",
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
    },
    FAILED: {
        label: "ব্যর্থ",
        icon: XCircle,
        ring: "ring-rose-200",
        dot: "bg-rose-500",
        text: "text-rose-700",
        bg: "bg-rose-50",
    },
};

interface StatusCounts {
    PENDING: number;
    SENT: number;
    DELIVERED: number;
    FAILED: number;
}

interface ExamOption {
    id: number;
    name: string;
}

interface Props {
    logs: SmsLogItem[];
    meta: SmsLogMeta | null;
    statusCounts: StatusCounts;
    activeStatus: SmsLogStatus | null;
    activeSearchTerm: string;
    exams: ExamOption[];
}

export default function SendResultSmsClient({
    logs,
    meta,
    statusCounts,
    activeStatus,
    activeSearchTerm,
    exams,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(activeSearchTerm);

    // ── Send SMS form state ──────────────────────────────────────────
    const [examId, setExamId] = useState("");
    const [force, setForce] = useState(false);
    const [isSending, startSendTransition] = useTransition();
    const [sendMessage, setSendMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSendMessage(null);

        if (!examId) {
            setSendMessage({ type: "error", text: "একটি পরীক্ষা নির্বাচন করুন" });
            return;
        }

        startSendTransition(async () => {
            const result = await queueResultSms({
                examId: Number(examId),
                force,
            });

            if (result.success && result.data) {
                setSendMessage({
                    type: "success",
                    text: `${result.data.examName} এর জন্য ${result.data.queued}টি SMS সারিবদ্ধ হয়েছে।`,
                });
                router.refresh();
            } else {
                setSendMessage({ type: "error", text: result.message });
            }
        });
    };

    // ── Log filter / pagination ─────────────────────────────────────
    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        if (!("page" in updates)) params.set("page", "1");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ searchTerm: search || null });
    };

    const page = meta?.page ?? 1;

    return (
        <div className="flex flex-col gap-8">
            {/* ── Send SMS panel ───────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <MessageSquareText className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="font-syne text-lg font-bold text-gray-900">
                            নতুন ফলাফল SMS পাঠান
                        </h2>
                        <p className="text-xs text-gray-500">
                            প্রকাশিত পরীক্ষা নির্বাচন করে অভিভাবকদের কাছে ফলাফল পাঠান
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSendSubmit} className="flex flex-col gap-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="examId"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                পরীক্ষা নির্বাচন করুন
                            </label>
                            <select
                                id="examId"
                                value={examId}
                                onChange={(e) => setExamId(e.target.value)}
                                disabled={isSending}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                            >
                                <option value="">-- পরীক্ষা নির্বাচন করুন --</option>
                                {exams.map((exam) => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.name}
                                    </option>
                                ))}
                            </select>
                            {exams.length === 0 && (
                                <p className="text-amber-600 text-xs mt-2">
                                    কোনো প্রকাশিত পরীক্ষা পাওয়া যায়নি।
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4">
                            <input
                                id="force"
                                type="checkbox"
                                checked={force}
                                onChange={(e) => setForce(e.target.checked)}
                                disabled={isSending}
                                className="w-4 h-4 accent-rose-600"
                            />
                            <label
                                htmlFor="force"
                                className="text-sm text-gray-700 cursor-pointer"
                            >
                                আগে পাঠানো SMS আবার পাঠান (Force Resend)
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSending || !examId}
                        className="w-full sm:w-auto self-end bg-gradient-to-r from-rose-600 to-amber-500 text-white font-semibold text-sm px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 transition-all disabled:opacity-50"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                SMS পাঠানো হচ্ছে...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                ফলাফল SMS পাঠান
                            </>
                        )}
                    </button>

                    {sendMessage && (
                        <div
                            className={`flex items-start gap-3 p-4 rounded-2xl text-sm ${
                                sendMessage.type === "success"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                        >
                            {sendMessage.type === "success" ? (
                                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            )}
                            <span>{sendMessage.text}</span>
                        </div>
                    )}
                </form>
            </div>

            {/* ── Logs section ─────────────────────────────────────── */}
            <div
                className={`flex flex-col gap-6 transition-opacity duration-200 ${
                    isPending ? "opacity-60" : "opacity-100"
                }`}
            >
                <h2 className="font-syne text-lg font-bold text-gray-900">এসএমএস লগ</h2>

                {/* Status pulse strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(STATUS_CONFIG) as SmsLogStatus[]).map((key) => {
                        const cfg = STATUS_CONFIG[key];
                        const Icon = cfg.icon;
                        const isActive = activeStatus === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() =>
                                    updateParams({ status: isActive ? null : key })
                                }
                                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                                    isActive
                                        ? `${cfg.bg} border-transparent ring-2 ${cfg.ring} scale-[1.02]`
                                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex h-2 w-2">
                                        <span
                                            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`}
                                        />
                                        <span
                                            className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`}
                                        />
                                    </span>
                                    <Icon
                                        className={`w-3.5 h-3.5 ${
                                            isActive ? cfg.text : "text-gray-400"
                                        }`}
                                    />
                                </div>
                                <p
                                    className={`font-syne text-2xl font-bold ${
                                        isActive ? cfg.text : "text-gray-800"
                                    }`}
                                >
                                    {statusCounts[key] ?? 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ফোন নম্বর বা মেসেজ খুঁজুন..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm"
                    />
                </form>

                {/* Log list */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {logs.length === 0 ? (
                        <div className="p-16 flex flex-col items-center gap-3 text-gray-400">
                            <Inbox className="w-8 h-8" />
                            <p className="text-sm">কোনো এসএমএস লগ পাওয়া যায়নি</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {logs.map((log) => {
                                const cfg = STATUS_CONFIG[log.status];
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                                    >
                                        <div
                                            className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}
                                        >
                                            <Icon className={`w-4 h-4 ${cfg.text}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                    {log.studentEnrollment?.student?.fullName ?? "—"}
                                                </p>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {log.phone}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {log.message}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {log.exam?.name}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}
                                            >
                                                {cfg.label}
                                            </span>
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {new Date(log.createdAt).toLocaleDateString(
                                                    "bn-BD",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            মোট{" "}
                            <span className="font-semibold text-gray-700">{meta.total}</span>টি
                            ফলাফলের মধ্যে {(meta.page - 1) * meta.limit + 1}–
                            {Math.min(meta.page * meta.limit, meta.total)}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!meta.hasPrevPage}
                                onClick={() => updateParams({ page: String(page - 1) })}
                                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-medium text-gray-600 px-2">
                                {meta.page} / {meta.totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={!meta.hasNextPage}
                                onClick={() => updateParams({ page: String(page + 1) })}
                                className="p-2 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}