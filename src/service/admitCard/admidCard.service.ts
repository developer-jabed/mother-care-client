/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export interface FailedAdmitCard {
    studentEnrollmentId: number;
    rollNumber: number | null;
    studentName: string | null;
    reason: string;
}

export interface AdmitCardSectionResult {
    mode: "queued" | "direct";
    jobId?: string;
    fileUrl?: string;
    totalStudents?: number;
    successCount?: number;
    failed?: FailedAdmitCard[];
}

export interface AdmitCardJobStatus {
    jobId: string;
    status: "waiting" | "active" | "completed" | "failed" | "not_found" | "not_available";
    fileUrl?: string;
    totalStudents?: number;
    successCount?: number;
    failed?: FailedAdmitCard[];
    error?: string;
}

export async function generateSectionAdmitCards(
    examId: number,
    classId: number,
    sectionId: number
) {
    try {
        const searchParams = new URLSearchParams({
            examId: String(examId),
            classId: String(classId),
            sectionId: String(sectionId),
        });

        const response = await serverFetch.get(`/admit-cards/section?${searchParams.toString()}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("admit-cards-list", "max");

            return {
                success: true,
                message: result.message || "প্রবেশপত্র তৈরি শুরু হয়েছে!",
                data: result.data as AdmitCardSectionResult,
            };
        }

        return {
            success: false,
            message: result.message || "প্রবেশপত্র তৈরি করতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Generate section admit cards error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function retryFailedAdmitCards(
    examId: number,
    classId: number,
    sectionId: number,
    enrollmentIds: number[]
) {
    try {
        const response = await serverFetch.post("/admit-cards/retry-failed", {
            body: JSON.stringify({ examId, classId, sectionId, enrollmentIds }),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("admit-cards-list", "max");

            return {
                success: true,
                message: result.message || "পুনরায় চেষ্টা শুরু হয়েছে!",
                data: result.data as AdmitCardSectionResult,
            };
        }

        return {
            success: false,
            message: result.message || "পুনরায় চেষ্টা ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Retry failed admit cards error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function getAdmitCardJobStatus(jobId: string) {
    try {
        const response = await serverFetch.get(`/admit-cards/job/${jobId}`);
        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                message: result.message || "স্ট্যাটাস পাওয়া গেছে",
                data: result.data as AdmitCardJobStatus,
            };
        }

        return {
            success: false,
            message: result.message || "স্ট্যাটাস পাওয়া যায়নি",
        };
    } catch (error: any) {
        console.error("Get admit card job status error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}