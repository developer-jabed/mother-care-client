import SendResultSmsClient from "@/components/result/sms/send-result-sms-client";
import SmsBalanceDisplay from "@/components/result/sms/SmsBalanceDisplay";
import { getExams } from "@/service/exam/exam.service";

export const dynamic = "force-dynamic";

export default async function SendResultSmsPage() {
    const { data: exams } = await getExams({
        isPublished: true,
        limit: 100
    });

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight">পরীক্ষার ফলাফল SMS পাঠান</h1>
                <p className="text-muted-foreground">
                    প্রকাশিত পরীক্ষা নির্বাচন করে অভিভাবকদের কাছে ফলাফলের SMS পাঠান
                </p>
            </div>

            {/* Balance Display */}
            <div className="max-w-md">
                <SmsBalanceDisplay />
            </div>

            {/* Main SMS Form */}
            <div>
                <SendResultSmsClient exams={exams} />
            </div>
        </div>
    );
}