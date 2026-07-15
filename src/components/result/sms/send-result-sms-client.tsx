"use client";

import { queueResultSms } from "@/service/smsLog/sms.service";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ExamOption {
    id: number;
    name: string;
}

interface Props {
    exams: ExamOption[];
}

export default function SendResultSmsClient({ exams }: Props) {
    const [examId, setExamId] = useState("");
    const [force, setForce] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!examId) {
            setMessage({ type: "error", text: "একটি পরীক্ষা নির্বাচন করুন" });
            return;
        }

        startTransition(async () => {
            const result = await queueResultSms({
                examId: Number(examId),
                force,
            });

            if (result.success && result.data) {
                setMessage({
                    type: "success",
                    text: `${result.data.examName} এর জন্য ${result.data.queued}টি SMS সারিবদ্ধ হয়েছে।`,
                });
            } else {
                setMessage({ type: "error", text: result.message });
            }
        });
    };

    return (
        <div className="max-w-lg">
            <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 shadow-sm space-y-6">
                <div>
                    <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-2">
                        পরীক্ষা নির্বাচন করুন
                    </label>
                    <select
                        id="examId"
                        value={examId}
                        onChange={(e) => setExamId(e.target.value)}
                        disabled={isPending}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- পরীক্ষা নির্বাচন করুন --</option>
                        {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                                {exam.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                    <input
                        id="force"
                        type="checkbox"
                        checked={force}
                        onChange={(e) => setForce(e.target.checked)}
                        disabled={isPending}
                        className="w-5 h-5 accent-blue-600"
                    />
                    <label htmlFor="force" className="text-sm text-gray-700 cursor-pointer">
                        আগে পাঠানো SMS আবার পাঠান (Force Resend)
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isPending || !examId}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-105 transition-all disabled:opacity-70"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            SMS পাঠানো হচ্ছে...
                        </>
                    ) : (
                        "ফলাফল SMS পাঠান"
                    )}
                </button>

                {exams.length === 0 && (
                    <p className="text-amber-600 text-center text-sm">কোনো প্রকাশিত পরীক্ষা পাওয়া যায়নি।</p>
                )}

                {message && (
                    <div
                        className={`flex items-start gap-3 p-4 rounded-2xl text-sm ${message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}
            </form>
        </div>
    );
}