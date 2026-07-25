/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { resultCardBatchSchema } from "@/zod/resultCart.validation";
import { revalidateTag } from "next/cache";


export interface GenerateResultCardBatchPayload {
    classId: number;
    sectionId: number;
    examId: number;
    onlyEnrollmentIds?: number[];
}

export type ResultCardBatchTriggerResult =
    | { success: true; mode: "queued"; jobId: string; statusUrl: string; message: string }
    | { success: true; mode: "direct"; blobUrl: string; message: string }
    | { success: false; message: string; errors?: Record<string, string> };

export type ResultCardJobStatus = {
    jobId: string;
    state: "waiting" | "active" | "completed" | "failed" | "delayed" | string;
    progress: number | object;
    result?: {
        fileUrl: string;
        totalStudents: number;
        successCount: number;
        failed: {
            studentEnrollmentId: number;
            rollNumber: number | null;
            studentName: string | null;
            reason: string;
        }[];
    };
    failedReason?: string;
};



/**
 * Batch result card generation — class + section + exam.
 * Backend decides queued vs. direct (Redis availability), so this handles
 * BOTH a JSON response (queued) and a raw PDF stream (direct fallback).
 */
export async function generateResultCardBatch(
    payload: GenerateResultCardBatchPayload
): Promise<ResultCardBatchTriggerResult> {
    const parsed = resultCardBatchSchema.safeParse(payload);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "অবৈধ ইনপুট",
        };
    }

    try {
        const response = await serverFetch.post("/result-cards/batch/section", {
            body: JSON.stringify(parsed.data),
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                message: errorBody?.message ?? "রেজাল্ট কার্ড তৈরি করা যায়নি",
                errors: errorBody?.errors ?? {},
            };
        }

        const contentType = response.headers.get("content-type") ?? "";

        // Direct-fallback path: API streamed a PDF straight back
        if (contentType.includes("application/pdf")) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                mode: "direct",
                blobUrl,
                message: "রেজাল্ট কার্ড সফলভাবে তৈরি হয়েছে!",
            };
        }

        // Queued path: API returned { jobId, statusUrl }
        const result = await response.json();

        return {
            success: true,
            mode: "queued",
            jobId: result.data.jobId,
            statusUrl: result.data.statusUrl,
            message: "রেজাল্ট কার্ড তৈরির কাজ শুরু হয়েছে, একটু অপেক্ষা করুন।",
        };
    } catch (error: any) {
        console.error("Generate result card batch error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}



/**
 * Polls a queued job's status. Call from client every 2-3s via
 * useTransition + setInterval until state is 'completed' or 'failed'.
 */
export async function getResultCardBatchStatus(
    jobId: string
): Promise<{ success: true; data: ResultCardJobStatus } | { success: false; message: string }> {
    try {
        const response = await serverFetch.get(`/result-cards/batch/${jobId}/status`);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                message: errorBody?.message ?? "জব স্ট্যাটাস পাওয়া যায়নি",
            };
        }

        const result = await response.json();
        const data = result.data as ResultCardJobStatus;

        // Once the job completes (or fails), invalidate related caches so
        // any dashboard/result views relying on this pick up fresh data.
        if (data.state === "completed" || data.state === "failed") {
            revalidateTag("admin-dashboard-meta", "max");
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Get result card batch status error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function generateSingleResultCard(
    studentEnrollmentId: number,
    examId: number
): Promise<
    | { success: true; blobUrl: string; message: string }
    | { success: false; message: string }
> {
    try {
        const response = await serverFetch.get(
            `/result-cards/${studentEnrollmentId}/${examId}`
        );

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                message: errorBody?.message ?? "রেজাল্ট কার্ড তৈরি করা যায়নি",
            };
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        return {
            success: true,
            blobUrl,
            message: "রেজাল্ট কার্ড সফলভাবে তৈরি হয়েছে!",
        };
    } catch (error: any) {
        console.error("Generate single result card error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}