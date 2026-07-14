import SendResultSmsClient from "@/components/result/sms/send-result-sms-client";
import { getExams } from "@/service/exam/exam.service";

export default async function SendResultSmsPage() {
    const { data: exams } = await getExams({ isPublished: true, limit: 100 });

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">পরীক্ষার ফলাফল SMS পাঠান</h1>
                <p className="text-sm text-muted-foreground">
                    প্রকাশিত পরীক্ষা নির্বাচন করে অভিভাবকদের ফলাফলের SMS পাঠান।
                </p>
            </div>

            <SendResultSmsClient exams={exams} />
        </div>
    );
}