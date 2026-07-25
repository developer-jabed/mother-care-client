/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ── Queue Result SMS ─────────────────────────────────────────────────

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
            revalidateTag(`exam-${payload.examId}-results`, "max");
            revalidateTag("admin-dashboard-meta", "max");
            revalidateTag("sms-logs", "max");

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

// ── Get SMS Logs (filterable, paginated) ────────────────────────────

export type SmsLogStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export interface SmsLogFilters {
    searchTerm?: string;
    examId?: number;
    studentEnrollmentId?: number;
    status?: SmsLogStatus;
    phone?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface SmsLogItem {
    id: number;
    studentEnrollmentId: number;
    examId: number;
    phone: string;
    message: string;
    status: SmsLogStatus;
    createdAt: string;
    updatedAt: string;
    exam: {
        id: number;
        name: string;
    };
    studentEnrollment: {
        student: {
            id: number;
            fullName: string;
            phone: string | null;
        };
    };
}

export interface SmsLogMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface GetSmsLogsState {
    success: boolean;
    message: string;
    data: SmsLogItem[];
    meta: SmsLogMeta | null;
}

export async function getSmsLogs(filters: SmsLogFilters = {}): Promise<GetSmsLogsState> {
    try {
        const searchParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const response = await serverFetch.get(
            `/sms/logs${queryString ? `?${queryString}` : ""}`,
            {
                next: { tags: ["sms-logs"] },
            }
        );

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                message: result.message,
                data: result.data ?? [],
                meta: result.meta ?? null,
            };
        }

        return {
            success: false,
            message: result.message || "এসএমএস লগ আনতে ব্যর্থ হয়েছে",
            data: [],
            meta: null,
        };
    } catch (error: any) {
        console.error("Get SMS logs error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === "development"
                ? error.message
                : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: [],
            meta: null,
        };
    }
}