/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export interface QueueResultSmsPayload {
    examId: number;
    force?: boolean;
}

export interface QueueResultSmsResponse {
    examName: string;
    totalPublishedResults: number;
    queued: number;
    skippedNoPhone: number;
    skippedAlreadySent: number;
}

interface ActionState {
    success: boolean;
    message: string;
    data?: QueueResultSmsResponse;
    errors?: Record<string, string[]>;
}

export async function queueResultSms(payload: QueueResultSmsPayload): Promise<ActionState> {
    try {
        const response = await serverFetch.post(`/sms/exams/${payload.examId}/send-result-sms`, {
            body: JSON.stringify({ force: payload.force ?? false }),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            // Revalidate relevant caches
            revalidateTag(`exam-${payload.examId}-results`, "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: `${result.data?.queued || 0}টি SMS সফলভাবে সারিবদ্ধ করা হয়েছে!`,
                data: result.data,
            };
        }

        return {
            success: false,
            message: result.message || "SMS পাঠাতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Queue result SMS error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === "development"
                ? error.message
                : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}