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

export interface AdmitCardResult {
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

export interface VerifyResult {
    valid: boolean;
    studentName?: string;
    admissionNumber?: string;
    photo?: string | null;
    rollNumber?: number;
    className?: string;
    sectionName?: string;
    examName?: string;
}

function handleError(error: any, label: string) {
    console.error(`${label} error:`, error);
    return {
        success: false as const,
        message:
            process.env.NODE_ENV === "development"
                ? error.message
                : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
    };
}

/**
 * GET /admit-cards/single?studentEnrollmentId=&examId=
 * Backend streams a raw PDF for this route (not JSON), so this returns a
 * blob URL the client can open/download directly.
 */
export async function generateSingleAdmitCard(studentEnrollmentId: number, examId: number) {
    try {
        const searchParams = new URLSearchParams({
            studentEnrollmentId: String(studentEnrollmentId),
            examId: String(examId),
        });

        const response = await serverFetch.get(`/admit-cards/single?${searchParams.toString()}`);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            return {
                success: false,
                message: errorBody?.message || "প্রবেশপত্র তৈরি করতে ব্যর্থ হয়েছে",
            };
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return {
            success: true,
            message: "প্রবেশপত্র তৈরি হয়েছে!",
            data: { pdfBase64: base64 },
        };
    } catch (error: any) {
        return handleError(error, "Generate single admit card");
    }
}

export async function generateSectionAdmitCards(examId: number, classId: number, sectionId: number) {
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
                data: result.data as AdmitCardResult,
            };
        }

        return { success: false, message: result.message || "প্রবেশপত্র তৈরি করতে ব্যর্থ হয়েছে" };
    } catch (error: any) {
        return handleError(error, "Generate section admit cards");
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
                data: result.data as AdmitCardResult,
            };
        }

        return { success: false, message: result.message || "পুনরায় চেষ্টা ব্যর্থ হয়েছে" };
    } catch (error: any) {
        return handleError(error, "Retry failed admit cards");
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

        return { success: false, message: result.message || "স্ট্যাটাস পাওয়া যায়নি" };
    } catch (error: any) {
        return handleError(error, "Get admit card job status");
    }
}

export async function verifyAdmitCard(enrollmentId: number, examId: number) {
    try {
        const response = await serverFetch.get(`/admit-cards/verify/${enrollmentId}/${examId}`);
        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                message: result.message || "যাচাই সম্পন্ন",
                data: result.data as VerifyResult,
            };
        }

        return { success: false, message: result.message || "প্রবেশপত্র যাচাই করা যায়নি" };
    } catch (error: any) {
        return handleError(error, "Verify admit card");
    }
}