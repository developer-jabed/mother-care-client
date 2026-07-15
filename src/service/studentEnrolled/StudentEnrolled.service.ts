/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import {
    createStudentEnrollmentZodSchema,
    updateStudentEnrollmentZodSchema,
    promoteStudentZodSchema,
    bulkPromoteZodSchema,
} from "@/zod/createStudentEnrolled.validation";
import { revalidateTag } from "next/cache";

// ---------- Types ----------
export interface StudentEnrollment {
    id: number;
    studentId: number;
    academicYearId: number;
    classId: number;
    sectionId: number;
    rollNumber: string;
    isCurrent: boolean;
    status: "ACTIVE" | "PROMOTED" | "COMPLETED" | "TRANSFERRED";
    createdAt: string;
    updatedAt: string;
    academicYear?: { id: number; title: string };
    class?: { id: number; name: string };
    section?: { id: number; name: string };
    student?: { id: number; fullName: string };
    promotedFrom?: { academicYearId: number } | null;
    results?: StudentResult[];
    smsLogs?: StudentSmsLog[];
}

export interface StudentResult {
    id: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    position: number | null;
    isPublished: boolean;
    exam?: {
        id: number;
        name: string;
        examType?: { id: number; name: string } | null;
    } | null;
    details?: StudentResultDetail[];
}

export interface StudentResultDetail {
    id: number;
    totalMarks: number;
    grade: string;
    subject?: { id: number; name: string } | null;
}

export interface StudentSmsLog {
    id: number;
    phone: string;
    status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
    exam?: { id: number; name: string } | null;
}

export interface EnrollmentOption {
    id: number;
    classId: number;
    className: string;
    sectionId: number;
    sectionName: string;
    student: {
        id: number;
        name: string;
        rollNumber?: string;
    };
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
}

// Matches zodValidator's actual shape: an array of { field, message }
type FieldError = { field: PropertyKey; message: string };

interface ActionResult<T = undefined> {
    success: boolean;
    message?: string;
    errors?: FieldError[];
    data?: T;
}

const REVALIDATE_PROFILE = "max";

// ---------- Create ----------

export async function createStudentEnrollment(
    prevState: any,
    formData: FormData
): Promise<ActionResult> {
    try {
        const validationPayload = {
            studentId: formData.get("studentId") as string,
            academicYearId: formData.get("academicYearId") as string,
            classId: formData.get("classId") as string,
            sectionId: formData.get("sectionId") as string,
            rollNumber: formData.get("rollNumber") as string,
        };

        const validated = zodValidator(validationPayload, createStudentEnrollmentZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/student-enrollments/create", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("student-enrollments-list", REVALIDATE_PROFILE);
            revalidateTag("admin-dashboard-meta", REVALIDATE_PROFILE);

            return {
                success: true,
                message: "শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "শিক্ষার্থী ভর্তি করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Create student enrollment error:", error);
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

export async function updateStudentEnrollment(
    id: number,
    prevState: any,
    formData: FormData
): Promise<ActionResult> {
    try {
        const validationPayload = {
            academicYearId: formData.get("academicYearId") as string,
            classId: formData.get("classId") as string,
            sectionId: formData.get("sectionId") as string,
            rollNumber: formData.get("rollNumber") as string,
            status: formData.get("status") as string,
        };

        const validated = zodValidator(validationPayload, updateStudentEnrollmentZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const response = await serverFetch.patch(`/student-enrollments/${id}`, {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("student-enrollments-list", REVALIDATE_PROFILE);
            revalidateTag(`student-enrollment-${id}`, REVALIDATE_PROFILE);
            revalidateTag("admin-dashboard-meta", REVALIDATE_PROFILE);

            return {
                success: true,
                message: "এনরোলমেন্ট সফলভাবে আপডেট করা হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "এনরোলমেন্ট আপডেট করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Update student enrollment error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

// ---------- Promote ----------

export async function promoteStudent(prevState: any, formData: FormData): Promise<ActionResult> {
    try {
        const validationPayload = {
            studentId: formData.get("studentId") as string,
            newAcademicYearId: formData.get("newAcademicYearId") as string,
            newClassId: formData.get("newClassId") as string,
            newSectionId: formData.get("newSectionId") as string,
            newRollNumber: formData.get("newRollNumber") as string,
        };

        const validated = zodValidator(validationPayload, promoteStudentZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/student-enrollments/promote", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("student-enrollments-list", REVALIDATE_PROFILE);
            revalidateTag("admin-dashboard-meta", REVALIDATE_PROFILE);

            return {
                success: true,
                message: "শিক্ষার্থী সফলভাবে পরবর্তী শ্রেণীতে উত্তীর্ণ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "শিক্ষার্থী উত্তীর্ণ করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Promote student error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

// ---------- Get by ID ----------

export async function getStudentEnrollmentById(
    id: number
): Promise<{ success: boolean; message?: string; data: StudentEnrollment | null }> {
    try {
        const response = await serverFetch.get(`/student-enrollments/${id}`, {
            next: { tags: [`student-enrollment-${id}`] },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "এনরোলমেন্ট পাওয়া যায়নি", data: null };
        }

        return { success: true, data: result.data };
    } catch (error: any) {
        console.error("Get student enrollment by id error:", error);
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

// ---------- Get all (paginated, filterable) ----------

interface GetAllStudentEnrollmentsParams {
    search?: string;
    page?: number;
    limit?: number;
    isCurrent?: boolean;
    academicYearId?: number;
    classId?: number;
    sectionId?: number;
}
export async function getAllStudentEnrollments(
    searchParams?: GetAllStudentEnrollmentsParams
): Promise<{ success: boolean; message?: string; data: StudentEnrollment[]; meta: PaginationMeta | null }> {
    try {
        const query = new URLSearchParams();
        if (searchParams?.search) query.set("search", searchParams.search);
        if (searchParams?.page) query.set("page", String(searchParams.page));
        if (searchParams?.limit) query.set("limit", String(searchParams.limit));
        if (searchParams?.isCurrent !== undefined) query.set("isCurrent", String(searchParams.isCurrent));
        if (searchParams?.academicYearId !== undefined) query.set("academicYearId", String(searchParams.academicYearId));
        if (searchParams?.classId !== undefined) query.set("classId", String(searchParams.classId));
        if (searchParams?.sectionId !== undefined) query.set("sectionId", String(searchParams.sectionId));

        const response = await serverFetch.get(`/student-enrollments?${query.toString()}`, {
            next: {
                tags: ["student-enrollments-list"],
                revalidate: 1800, // 30 minutes
            },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "তালিকা লোড করতে ব্যর্থ হয়েছে", data: [], meta: null };
        }

        return { success: true, data: result.data, meta: result.meta };
    } catch (error: any) {
        console.error("Get all student enrollments error:", error);
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

export async function getEnrollmentOptions(
    searchParams?: Pick<GetAllStudentEnrollmentsParams, "academicYearId" | "classId" | "sectionId">
): Promise<EnrollmentOption[]> {
    const result = await getAllStudentEnrollments({
        ...searchParams,
        isCurrent: true,
        limit: 500,
    });

    if (!result.success) return [];

    return result.data
        .filter(
            (enrollment) =>
                enrollment.student != null && enrollment.class != null && enrollment.section != null
        )
        .map((enrollment) => ({
            id: enrollment.id,
            classId: enrollment.class!.id,
            className: enrollment.class!.name,
            sectionId: enrollment.section!.id,
            sectionName: enrollment.section!.name,
            student: {
                id: enrollment.student!.id,
                name: enrollment.student!.fullName,
                rollNumber: enrollment.rollNumber,
            },
        }));
}



export interface RankedStudent {
    studentId: number;
    enrollmentId: number;
    name: string;
    currentRoll: number;
    examsCounted: number;
    percentage: number | null;
    suggestedRoll: number;
}

// ---------- Get performance ranking ----------

export async function getPerformanceRanking(params: {
    academicYearId: number;
    classId: number;
    sectionId: number;
}): Promise<{ success: boolean; message?: string; data: RankedStudent[] }> {
    try {
        const query = new URLSearchParams();
        query.set("academicYearId", String(params.academicYearId));
        query.set("classId", String(params.classId));
        query.set("sectionId", String(params.sectionId));

        const response = await serverFetch.get(
            `/student-enrollments/performance-ranking?${query.toString()}`
        );

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message || "তালিকা লোড করতে ব্যর্থ হয়েছে", data: [] };
        }

        return { success: true, data: result.data };
    } catch (error: any) {
        console.error("Get performance ranking error:", error);
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

// ---------- Bulk promote ----------

export async function bulkPromoteStudents(prevState: any, formData: FormData): Promise<ActionResult> {
    try {
        const raw = formData.get("payload") as string;
        const parsed = raw ? JSON.parse(raw) : null;

        if (!parsed) {
            return { success: false, message: "উত্তীর্ণের তথ্য পাওয়া যায়নি" };
        }

        const validated = zodValidator(parsed, bulkPromoteZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || [],
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/student-enrollments/bulk-promote", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("student-enrollments-list", REVALIDATE_PROFILE);
            revalidateTag("admin-dashboard-meta", REVALIDATE_PROFILE);

            return {
                success: true,
                message: result.message || "শিক্ষার্থীরা সফলভাবে উত্তীর্ণ হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "উত্তীর্ণ করতে ব্যর্থ হয়েছে",
            errors: result.errors || [],
        };
    } catch (error: any) {
        console.error("Bulk promote students error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}