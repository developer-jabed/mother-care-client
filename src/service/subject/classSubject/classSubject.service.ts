/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import {
    createClassSubjectZodSchema,
    getClassSubjectsResponseZodSchema,
    getSubjectsForClassSectionResponseZodSchema,
    updateClassSubjectZodSchema,
} from "@/zod/classSubject.validation";
import { revalidateTag } from "next/cache";
import type { z } from "zod";

export async function createClassSubject(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            classId: formData.get("classId") as string,
            sectionId: (formData.get("sectionId") as string) || undefined,
            subjectId: formData.get("subjectId") as string,
        };

        const validated = zodValidator(validationPayload, createClassSubjectZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/class-subjects", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("class-subjects-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "বিষয় সফলভাবে নির্ধারণ করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "বিষয় নির্ধারণ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create class subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}



export async function updateClassSubject(id: number, prevState: any, formData: FormData) {
    try {
        const validationPayload: Record<string, unknown> = {};

        if (formData.get("classId")) validationPayload.classId = formData.get("classId") as string;
        if (formData.has("sectionId")) {
            const sectionId = formData.get("sectionId") as string;
            validationPayload.sectionId = sectionId || undefined;
        }
        if (formData.get("subjectId")) validationPayload.subjectId = formData.get("subjectId") as string;

        const validated = zodValidator(validationPayload, updateClassSubjectZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.patch(`/class-subjects/${id}`, {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("class-subjects-list", "max");
            revalidateTag(`class-subject-${id}`, "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "বিষয় নির্ধারণ সফলভাবে হালনাগাদ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "হালনাগাদ করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update class subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}


export async function deleteClassSubject(id: number) {
    try {
        const response = await serverFetch.delete(`/class-subjects/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("class-subjects-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "বিষয় নির্ধারণ মুছে ফেলা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete class subject error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export type ClassSubject = z.infer<typeof getClassSubjectsResponseZodSchema>[number];

interface GetClassSubjectsParams {
    classId?: number;
    sectionId?: number;
    subjectId?: number;
    page?: number;
    limit?: number;
}

export async function getClassSubjects(params: GetClassSubjectsParams = {}): Promise<{
    data: ClassSubject[];
    meta: { page: number; limit: number; total: number } | null;
}> {
    try {
        const query = new URLSearchParams();
        if (params.classId) query.set("classId", String(params.classId));
        if (params.sectionId) query.set("sectionId", String(params.sectionId));
        if (params.subjectId) query.set("subjectId", String(params.subjectId));
        if (params.page) query.set("page", String(params.page));
        if (params.limit) query.set("limit", String(params.limit));

        const response = await serverFetch.get(`/class-subjects?${query.toString()}`, {
            next: { tags: ["class-subjects-list"] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getClassSubjects failed:", result.message);
            return { data: [], meta: null };
        }

        const parsed = getClassSubjectsResponseZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getClassSubjects response shape mismatch:", parsed.error);
            return { data: [], meta: null };
        }

        return { data: parsed.data, meta: result.meta ?? null };
    } catch (error) {
        console.error("Get class subjects error:", error);
        return { data: [], meta: null };
    }
}

// ── New: subjects scoped to a class + section, for the mark-entry sheet ───
export type SubjectForSection = z.infer<typeof getSubjectsForClassSectionResponseZodSchema>[number];

export async function getSubjectsForClassSection(
    classId: number,
    sectionId: number
): Promise<SubjectForSection[]> {
    try {
        const query = new URLSearchParams();
        query.set("classId", String(classId));
        query.set("sectionId", String(sectionId));

        const response = await serverFetch.get(`/class-subjects/subjects?${query.toString()}`, {
            next: { tags: [`class-subjects-${classId}-${sectionId}`] },
        });

        const result = await response.json();

        if (!result.success) {
            console.error("getSubjectsForClassSection failed:", result.message);
            return [];
        }

        const parsed = getSubjectsForClassSectionResponseZodSchema.safeParse(result.data);

        if (!parsed.success) {
            console.error("getSubjectsForClassSection response shape mismatch:", parsed.error);
            return [];
        }

        return parsed.data;
    } catch (error) {
        console.error("Get subjects for class section error:", error);
        return [];
    }
}