import SendResultSmsClient from "@/components/result/sms/send-result-sms-client";
import SmsBalanceDisplay from "@/components/result/sms/SmsBalanceDisplay";
import { getExams } from "@/service/exam/exam.service";
import { getSmsLogs, type SmsLogStatus } from "@/service/smsLog/sms.service";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{
        searchTerm?: string;
        status?: string;
        page?: string;
    }>;
}

const VALID_STATUSES: SmsLogStatus[] = ["PENDING", "SENT", "DELIVERED", "FAILED"];

export default async function SendResultSmsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const searchTerm = params.searchTerm ?? "";
    const status = VALID_STATUSES.includes(params.status as SmsLogStatus)
        ? (params.status as SmsLogStatus)
        : null;
    const page = Number(params.page ?? 1);

    // Parallel data fetching
    const [examsResult, logsResult, pendingCount, sentCount, deliveredCount, failedCount] =
        await Promise.all([
            getExams({ isPublished: true, limit: 100 }),
            getSmsLogs({
                searchTerm: searchTerm || undefined,
                status: status ?? undefined,
                page,
                limit: 15,
                sortBy: "createdAt",
                sortOrder: "desc",
            }),
            getSmsLogs({ searchTerm: searchTerm || undefined, status: "PENDING", page: 1, limit: 1 }),
            getSmsLogs({ searchTerm: searchTerm || undefined, status: "SENT", page: 1, limit: 1 }),
            getSmsLogs({ searchTerm: searchTerm || undefined, status: "DELIVERED", page: 1, limit: 1 }),
            getSmsLogs({ searchTerm: searchTerm || undefined, status: "FAILED", page: 1, limit: 1 }),
        ]);

    const statusCounts = {
        PENDING: pendingCount.meta?.total ?? 0,
        SENT: sentCount.meta?.total ?? 0,
        DELIVERED: deliveredCount.meta?.total ?? 0,
        FAILED: failedCount.meta?.total ?? 0,
    };

    return (
        <div className="flex flex-col gap-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="font-syne text-3xl font-bold tracking-tight text-gray-900">
                    এসএমএস লগ
                </h1>
                <p className="text-muted-foreground">
                    পাঠানো ফলাফল এসএমএসের অবস্থা দেখুন ও ফিল্টার করুন
                </p>
            </div>

            {/* Balance */}
            <div className="max-w-md">
                <SmsBalanceDisplay />
            </div>

            {/* Full SMS Log UI (send form + status cards + list) */}
            <SendResultSmsClient
                logs={logsResult.data}
                meta={logsResult.meta}
                statusCounts={statusCounts}
                activeStatus={status}
                activeSearchTerm={searchTerm}
                exams={examsResult.data ?? []}
            />
        </div>
    );
}