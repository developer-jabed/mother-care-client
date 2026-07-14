/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export interface ResultDetailPayload {
    subjectId: number;
    writtenMarks?: number;
    mcqMarks?: number;
    practicalMarks?: number;
    vivaMarks?: number;
}

export interface CreateResultPayload {
    studentEnrollmentId: number;
    examId: number;
    remarks?: string;
    details: ResultDetailPayload[];
}

export interface UpdateResultPayload {
    remarks?: string;
    details?: ResultDetailPayload[];
}

export interface ResultDetail {
    id: number;
    resultId: number;
    subjectId: number;
    writtenMarks: number | null;
    mcqMarks: number | null;
    practicalMarks: number | null;
    vivaMarks: number | null;
    totalMarks: number;
    grade: string;
    gradePoint: number;
    subject: {
        id: number;
        name: string;
        fullMarks: number;
    };
}

export interface Result {
    id: number;
    studentEnrollmentId: number;
    examId: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    gradePoint: number;
    position: number | null;
    remarks: string | null;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    details: ResultDetail[];
    enrollment: {
        id: number;
        studentId: number;
    };
    exam: {
        id: number;
        name: string;
        academicYearId: number;
    };
}

interface ActionState {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}


function resultTags(result: { id?: number; examId?: number; studentEnrollmentId?: number }) {
    const tags = ["results-list"];
    if (result.id) tags.push(`result-${result.id}`);
    if (result.examId) tags.push(`exam-${result.examId}-results`);
    if (result.studentEnrollmentId) tags.push(`enrollment-${result.studentEnrollmentId}-results`);
    return tags;
}

export async function createResult(payload: CreateResultPayload): Promise<ActionState> {
    try {
        const response = await serverFetch.post("/results", {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            resultTags({ examId: payload.examId, studentEnrollmentId: payload.studentEnrollmentId }).forEach(
                (tag) => revalidateTag(tag, "max")
            );
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "ফলাফল সফলভাবে তৈরি করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "ফলাফল তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create result error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function updateResult(id: number, payload: UpdateResultPayload): Promise<ActionState> {
    try {
        const response = await serverFetch.patch(`/results/${id}`, {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            resultTags({
                id,
                examId: result.data?.examId,
                studentEnrollmentId: result.data?.studentEnrollmentId,
            }).forEach((tag) => revalidateTag(tag, "max"));
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "ফলাফল সফলভাবে হালনাগাদ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "হালনাগাদ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update result error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function publishResult(id: number, isPublished: boolean): Promise<ActionState> {
    try {
        const response = await serverFetch.patch(`/results/${id}/publish`, {
            body: JSON.stringify({ isPublished }),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            resultTags({
                id,
                examId: result.data?.examId,
                studentEnrollmentId: result.data?.studentEnrollmentId,
            }).forEach((tag) => revalidateTag(tag, "max"));
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: isPublished
                    ? "ফলাফল প্রকাশ করা হয়েছে!"
                    : "ফলাফল অপ্রকাশিত করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "প্রকাশ করতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Publish result error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function calculatePositions(examId: number): Promise<ActionState> {
    try {
        const response = await serverFetch.post(`/results/exam/${examId}/calculate-positions`, {
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("results-list", "max");
            revalidateTag(`exam-${examId}-results`, "max");

            return {
                success: true,
                message: `${result.data?.updated ?? 0}টি ফলাফলের অবস্থান নির্ধারণ করা হয়েছে!`,
            };
        }

        return {
            success: false,
            message: result.message || "অবস্থান নির্ধারণ করতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Calculate positions error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function deleteResult(id: number): Promise<ActionState> {
    try {
        const response = await serverFetch.delete(`/results/${id}`);
        const result = await response.json();

        if (result.success) {
            resultTags({
                id,
                examId: result.data?.examId,
                studentEnrollmentId: result.data?.studentEnrollmentId,
            }).forEach((tag) => revalidateTag(tag, "max"));
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "ফলাফল মুছে ফেলা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete result error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

interface GetResultsParams {
    examId?: number;
    studentEnrollmentId?: number;
    isPublished?: boolean;
    searchTerm?: string;
    page?: number;
    limit?: number;
}

export async function getResults(params: GetResultsParams = {}): Promise<{
    data: Result[];
    meta: { page: number; limit: number; total: number } | null;
}> {
    try {
        const query = new URLSearchParams();
        if (params.examId) query.set("examId", String(params.examId));
        if (params.studentEnrollmentId) query.set("studentEnrollmentId", String(params.studentEnrollmentId));
        if (params.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
        if (params.searchTerm) query.set("searchTerm", params.searchTerm);
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));

        const response = await serverFetch.get(`/results?${query.toString()}`, {
            next: { tags: ["results-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getResults failed:", result.message);
            return { data: [], meta: null };
        }

        return { data: result.data as Result[], meta: result.meta ?? null };
    } catch (error) {
        console.error("Get results error:", error);
        return { data: [], meta: null };
    }
}

export async function getSingleResult(id: number): Promise<Result | null> {
    try {
        const response = await serverFetch.get(`/results/${id}`, {
            next: { tags: [`result-${id}`] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getSingleResult failed:", result.message);
            return null;
        }

        return result.data as Result;
    } catch (error) {
        console.error("Get single result error:", error);
        return null;
    }
}