"use client";

import { queueResultSms } from "@/service/smsLog/sms.service";
import { useState, useTransition } from "react";

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
                    text: `${result.data.examName}: ${result.data.queued}টি SMS পাঠানো হচ্ছে। (${result.data.skippedAlreadySent}টি আগেই পাঠানো হয়েছে, ${result.data.skippedNoPhone}টি ফোন নম্বর নেই)`,
                });
            } else {
                setMessage({ type: "error", text: result.message });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6 max-w-lg">
            <div>
                <label htmlFor="examId" className="block text-sm font-medium mb-1">
                    পরীক্ষা নির্বাচন করুন
                </label>
                <select
                    id="examId"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={isPending}
                >
                    <option value="">-- পরীক্ষা নির্বাচন করুন --</option>
                    {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                            {exam.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="force"
                    type="checkbox"
                    checked={force}
                    onChange={(e) => setForce(e.target.checked)}
                    disabled={isPending}
                />
                <label htmlFor="force" className="text-sm">
                    আগে পাঠানো SMS আবার পাঠান (force)
                </label>
            </div>

            <button
                type="submit"
                disabled={isPending || exams.length === 0}
                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium disabled:opacity-50"
            >
                {isPending ? "পাঠানো হচ্ছে..." : "SMS পাঠান"}
            </button>

            {exams.length === 0 && (
                <p className="text-sm text-amber-600">কোনো প্রকাশিত পরীক্ষা পাওয়া যায়নি।</p>
            )}

            {message && (
                <p
                    className={`text-sm p-3 rounded-md ${message.type === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                >
                    {message.text}
                </p>
            )}
        </form>
    );
}