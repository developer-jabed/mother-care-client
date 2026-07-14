/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { revalidateTag } from "next/cache";
import type { z } from "zod";
import {
    createExamZodSchema,
    updateExamZodSchema,
    getExamsResponseZodSchema,
    createExamTypeZodSchema,
    updateExamTypeZodSchema,
    getExamTypesResponseZodSchema,
} from "@/zod/exam.validation";


export async function createExam(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            name: formData.get("name") as string,
            academicYearId: formData.get("academicYearId") as string,
            examTypeId: formData.get("examTypeId") as string,
            startDate: formData.get("startDate") as string,
            endDate: formData.get("endDate") as string,
            isPublished: formData.get("isPublished") as string,
        };

        const validated = zodValidator(validationPayload, createExamZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const response = await serverFetch.post("/exams", {
            body: JSON.stringify(validated.data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exams-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষা সফলভাবে তৈরি করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "পরীক্ষা তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create exam error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function updateExam(id: number, prevState: any, formData: FormData) {
    try {
        const validationPayload: Record<string, unknown> = {};

        if (formData.get("name")) validationPayload.name = formData.get("name") as string;
        if (formData.get("academicYearId"))
            validationPayload.academicYearId = formData.get("academicYearId") as string;
        if (formData.get("examTypeId"))
            validationPayload.examTypeId = formData.get("examTypeId") as string;
        if (formData.get("startDate")) validationPayload.startDate = formData.get("startDate") as string;
        if (formData.get("endDate")) validationPayload.endDate = formData.get("endDate") as string;
        if (formData.has("isPublished"))
            validationPayload.isPublished = formData.get("isPublished") as string;

        const validated = zodValidator(validationPayload, updateExamZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const response = await serverFetch.patch(`/exams/${id}`, {
            body: JSON.stringify(validated.data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exams-list", "max");
            revalidateTag(`exam-${id}`, "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষা সফলভাবে হালনাগাদ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "হালনাগাদ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update exam error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function deleteExam(id: number) {
    try {
        const response = await serverFetch.delete(`/exams/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("exams-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষা মুছে ফেলা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete exam error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export type Exam = z.infer<typeof getExamsResponseZodSchema>[number];

interface GetExamsParams {
    academicYearId?: number;
    examTypeId?: number;
    isPublished?: boolean;
    searchTerm?: string;
    page?: number;
    limit?: number;
}

export async function getExams(params: GetExamsParams = {}): Promise<{
    data: Exam[];
    meta: { page: number; limit: number; total: number } | null;
}> {
    try {
        const query = new URLSearchParams();
        if (params.academicYearId) query.set("academicYearId", String(params.academicYearId));
        if (params.examTypeId) query.set("examTypeId", String(params.examTypeId));
        if (params.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
        if (params.searchTerm) query.set("searchTerm", params.searchTerm);
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));

        const response = await serverFetch.get(`/exams?${query.toString()}`, {
            next: { tags: ["exams-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getExams failed:", result.message);
            return { data: [], meta: null };
        }

        const parsed = getExamsResponseZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getExams response shape mismatch:", parsed.error);
            return { data: [], meta: null };
        }

        return { data: parsed.data, meta: result.meta ?? null };
    } catch (error) {
        console.error("Get exams error:", error);
        return { data: [], meta: null };
    }
}

/* -------------------------------------------------------------------------- */
/*                                 Exam Type                                  */
/* -------------------------------------------------------------------------- */

export async function createExamType(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            name: formData.get("name") as string,
        };

        const validated = zodValidator(validationPayload, createExamTypeZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const response = await serverFetch.post("/exam-types", {
            body: JSON.stringify(validated.data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-types-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষার ধরন সফলভাবে তৈরি করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "পরীক্ষার ধরন তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create exam type error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function updateExamType(id: number, prevState: any, formData: FormData) {
    try {
        const validationPayload: Record<string, unknown> = {};

        if (formData.get("name")) validationPayload.name = formData.get("name") as string;

        const validated = zodValidator(validationPayload, updateExamTypeZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const response = await serverFetch.patch(`/exam-types/${id}`, {
            body: JSON.stringify(validated.data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-types-list", "max");
            revalidateTag(`exam-type-${id}`, "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষার ধরন সফলভাবে হালনাগাদ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "হালনাগাদ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update exam type error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function deleteExamType(id: number) {
    try {
        const response = await serverFetch.delete(`/exam-types/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-types-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "পরীক্ষার ধরন মুছে ফেলা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete exam type error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export type ExamType = z.infer<typeof getExamTypesResponseZodSchema>[number];

interface GetExamTypesParams {
    searchTerm?: string;
    page?: number;
    limit?: number;
}

export async function getExamTypes(params: GetExamTypesParams = {}): Promise<{
    data: ExamType[];
    meta: { page: number; limit: number; total: number } | null;
}> {
    try {
        const query = new URLSearchParams();
        if (params.searchTerm) query.set("searchTerm", params.searchTerm);
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));

        const response = await serverFetch.get(`/exam-types?${query.toString()}`, {
            next: { tags: ["exam-types-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getExamTypes failed:", result.message);
            return { data: [], meta: null };
        }

        const parsed = getExamTypesResponseZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getExamTypes response shape mismatch:", parsed.error);
            return { data: [], meta: null };
        }

        return { data: parsed.data, meta: result.meta ?? null };
    } catch (error) {
        console.error("Get exam types error:", error);
        return { data: [], meta: null };
    }
}