/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import {
    createGradingScaleZodSchema,
    updateGradingScaleZodSchema,
} from "@/zod/gradingScale.validation";
import { revalidateTag } from "next/cache";

export interface GradingScale {
    id: number;
    academicYearId: number;
    grade: string;
    minPercentage: number;
    maxPercentage: number;
    gradePoint: number;
    academicYear?: { id: number; title: string };
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
    success: boolean;
    message?: string;
    errors?: FieldError[];
    data?: T;
}

const REVALIDATE_MAX = "max";

// ---------- Create ----------

export async function createGradingScale(
    prevState: any,
    formData: FormData
): Promise<ActionResult> {
    try {
        const validationPayload = {
            academicYearId: formData.get("academicYearId") as string,
            grade: formData.get("grade") as string,
            minPercentage: formData.get("minPercentage") as string,
            maxPercentage: formData.get("maxPercentage") as string,
            gradePoint: formData.get("gradePoint") as string,
        };

        const validated = zodValidator(validationPayload, createGradingScaleZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const backendPayload = {
            academicYearId: Number(data.academicYearId),
            grade: data.grade,
            minPercentage: Number(data.minPercentage),
            maxPercentage: Number(data.maxPercentage),
            gradePoint: Number(data.gradePoint),
        };

        const response = await serverFetch.post("/grades", {
            body: JSON.stringify(backendPayload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("grading-scales-list", REVALIDATE_MAX);
            revalidateTag(`grading-scales-year-${data.academicYearId}`, REVALIDATE_MAX);

            return {
                success: true,
                message: "গ্রেডিং স্কেল সফলভাবে তৈরি হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "গ্রেডিং স্কেল তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Create grading scale error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

// ---------- Update ----------

export async function updateGradingScale(
    id: number,
    prevState: any,
    formData: FormData
): Promise<ActionResult> {
    try {
        const validationPayload = {
            grade: formData.get("grade") as string,
            minPercentage: formData.get("minPercentage") as string,
            maxPercentage: formData.get("maxPercentage") as string,
            gradePoint: formData.get("gradePoint") as string,
        };

        const validated = zodValidator(validationPayload, updateGradingScaleZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const backendPayload = {
            ...(data.grade !== undefined && { grade: data.grade }),
            ...(data.minPercentage !== undefined && { minPercentage: Number(data.minPercentage) }),
            ...(data.maxPercentage !== undefined && { maxPercentage: Number(data.maxPercentage) }),
            ...(data.gradePoint !== undefined && { gradePoint: Number(data.gradePoint) }),
        };

        const response = await serverFetch.patch(`/grades/${id}`, {
            body: JSON.stringify(backendPayload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("grading-scales-list", REVALIDATE_MAX);
            revalidateTag(`grading-scale-${id}`, REVALIDATE_MAX);

            return {
                success: true,
                message: "গ্রেডিং স্কেল সফলভাবে আপডেট করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "গ্রেডিং স্কেল আপডেট করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Update grading scale error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

// ---------- Delete ----------

export async function deleteGradingScale(id: number): Promise<ActionResult> {
    try {
        const response = await serverFetch.delete(`/grades/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("grading-scales-list", REVALIDATE_MAX);
            return { success: true, message: "গ্রেডিং স্কেল সফলভাবে মুছে ফেলা হয়েছে!" };
        }

        return {
            success: false,
            message: result.message || "গ্রেডিং স্কেল মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete grading scale error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

// ---------- Get all (paginated, filterable) ----------

interface GetAllGradingScalesParams {
    searchTerm?: string;
    academicYearId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getAllGradingScales(
    params?: GetAllGradingScalesParams
): Promise<{ success: boolean; message?: string; data: GradingScale[]; meta: PaginationMeta | null }> {
    try {
        const query = new URLSearchParams();
        if (params?.searchTerm) query.set("searchTerm", params.searchTerm);
        if (params?.academicYearId !== undefined) query.set("academicYearId", String(params.academicYearId));
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        if (params?.sortBy) query.set("sortBy", params.sortBy);
        if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

        const response = await serverFetch.get(`/grades?${query.toString()}`, {
            next: { tags: ["grading-scales-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "তালিকা লোড করতে ব্যর্থ হয়েছে", data: [], meta: null };
        }

        return { success: true, data: result.data, meta: result.meta };
    } catch (error: any) {
        console.error("Get all grading scales error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: [],
            meta: null,
        };
    }
}

// ---------- Get all by academic year ----------

export async function getGradingScalesByAcademicYear(
    academicYearId: number
): Promise<{ success: boolean; message?: string; data: GradingScale[] }> {
    try {
        const response = await serverFetch.get(`/grades/by-academic-year/${academicYearId}`, {
            next: { tags: [`grading-scales-year-${academicYearId}`] },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "গ্রেডিং স্কেল পাওয়া যায়নি", data: [] };
        }

        return { success: true, data: result.data };
    } catch (error: any) {
        console.error("Get grading scales by academic year error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: [],
        };
    }
}

// ---------- Get single ----------

export async function getSingleGradingScale(
    id: number
): Promise<{ success: boolean; message?: string; data: GradingScale | null }> {
    try {
        const response = await serverFetch.get(`/grades/${id}`, {
            next: { tags: [`grading-scale-${id}`] },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "গ্রেডিং স্কেল পাওয়া যায়নি", data: null };
        }

        return { success: true, data: result.data };
    } catch (error: any) {
        console.error("Get single grading scale error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: null,
        };
    }
}