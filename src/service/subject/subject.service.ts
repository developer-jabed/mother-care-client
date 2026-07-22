/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createSubjectZodSchema, getSubjectsResponseZodSchema, subjectZodSchema, updateSubjectZodSchema } from "@/zod/subject.validation";
import { revalidateTag } from "next/cache";
import type { z } from "zod";


export async function createSubject(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            code: formData.get("code") as string,
            name: formData.get("name") as string,
            fullMarks: formData.get("fullMarks") as string,
            passMarks: formData.get("passMarks") as string,
            credit: (formData.get("credit") as string) || undefined,
            isOptional: formData.get("isOptional") === "true",
            classId: formData.get("classId") as string, // 👈 নতুন
        };

        const validated = zodValidator(validationPayload, createSubjectZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/subjects", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("subjects-list", "max");
            revalidateTag("admin-dashboard-meta", "max");
            revalidateTag("class-subjects-list", "max"); // 👈 নতুন — auto-assign হওয়া class-subject লিস্টও রিভ্যালিডেট করুন

            return {
                success: true,
                message: "বিষয় সফলভাবে তৈরি হয়েছে!",
                data: result.data,
            };
        }

        return {
            success: false,
            message: result.message || "বিষয় তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}


export async function updateSubject(id: number, prevState: any, formData: FormData) {
    try {
        const validationPayload: Record<string, unknown> = {};

        if (formData.get("code")) validationPayload.code = formData.get("code") as string;
        if (formData.get("name")) validationPayload.name = formData.get("name") as string;
        if (formData.get("fullMarks")) validationPayload.fullMarks = formData.get("fullMarks") as string;
        if (formData.get("passMarks")) validationPayload.passMarks = formData.get("passMarks") as string;
        if (formData.get("credit")) validationPayload.credit = formData.get("credit") as string;
        if (formData.has("isOptional")) validationPayload.isOptional = formData.get("isOptional") === "true";

        const validated = zodValidator(validationPayload, updateSubjectZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.patch(`/subjects/${id}`, {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("subjects-list", "max");
            revalidateTag(`subject-${id}`, "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "বিষয় সফলভাবে হালনাগাদ হয়েছে!",
                data: result.data,
            };
        }

        return {
            success: false,
            message: result.message || "বিষয় হালনাগাদ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}


export async function deleteSubject(id: number) {
    try {
        const response = await serverFetch.delete(`/subjects/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("subjects-list", "max");
            revalidateTag("admin-dashboard-meta", "max");
            revalidateTag("class-subjects-list", "max"); // 👈 নতুন

            return {
                success: true,
                message: "বিষয় সফলভাবে মুছে ফেলা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "বিষয় মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}



export type Subject = z.infer<typeof getSubjectsResponseZodSchema>[number];

interface GetSubjectsParams {
    searchTerm?: string;
    isOptional?: boolean;
    page?: number;
    limit?: number;
}

export async function getSubjects(params: GetSubjectsParams = {}): Promise<{
    data: Subject[];
    meta: { page: number; limit: number; total: number } | null;
}> {
    try {
        const query = new URLSearchParams();
        if (params.searchTerm) query.set("searchTerm", params.searchTerm);
        if (params.isOptional !== undefined) query.set("isOptional", String(params.isOptional));
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));

        const response = await serverFetch.get(`/subjects?${query.toString()}`, {
            next: { tags: ["subjects-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getSubjects failed:", result.message);
            return { data: [], meta: null };
        }

        const parsed = getSubjectsResponseZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getSubjects response shape mismatch:", parsed.error);
            return { data: [], meta: null };
        }

        return { data: parsed.data, meta: result.meta ?? null };
    } catch (error) {
        console.error("Get subjects error:", error);
        return { data: [], meta: null };
    }
}

export async function getSubject(id: number) {
    try {
        const response = await serverFetch.get(`/subjects/${id}`, {
            next: { tags: [`subject-${id}`] },
        });

        const result = await response.json();

        if (!result.success) return null;

        const parsed = subjectZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getSubject response shape mismatch:", parsed.error);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error("Get subject error:", error);
        return null;
    }
}