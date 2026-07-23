/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createStudentZodSchema } from "@/zod/student.validation";
import { revalidateTag } from "next/cache";
import { StudentEnrollment } from "../studentEnrolled/StudentEnrolled.service";
export async function createStudent(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,

            fullName: formData.get("fullName") as string,
            fatherName: formData.get("fatherName") as string,   // ✅ NEW
            motherName: formData.get("motherName") as string,   // ✅ NEW
            gender: formData.get("gender") as string,
            dateOfBirth: formData.get("dateOfBirth") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
        };

        const validated = zodValidator(validationPayload, createStudentZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const backendPayload = {
            user: {
                email: data.email,
                password: data.password,
            },
            student: {
                fullName: data.fullName,
                fatherName: data.fatherName,   // ✅ NEW
                motherName: data.motherName,   // ✅ NEW
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                phone: data.phone,
                address: data.address,
            },
        };

        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(backendPayload));

        const file = formData.get("file") as File | null;

        // ── TEMP DEBUG — remove after diagnosing ──────────────────────
        console.log("=== FILE DEBUG ===");
        console.log("file exists:", !!file);
        console.log("file name:", file?.name);
        console.log("file size:", file?.size);
        console.log("file type:", file?.type);
        // ───────────────────────────────────────────────────────────────

        if (file && file.size > 0) {
            newFormData.append("file", file);
        }

        // ── TEMP DEBUG — confirm what's actually in newFormData ───────
        console.log("=== FORMDATA ENTRIES ===");
        for (const [key, value] of newFormData.entries()) {
            console.log(key, value instanceof File ? `File(${value.name}, ${value.size}b, ${value.type})` : value);
        }
        // ───────────────────────────────────────────────────────────────

        const response = await serverFetch.post("/students/create-student", {
            body: newFormData,
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag("students-page-1", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "Student enrolled successfully!",
                studentId: result.data?.student?.id ?? result.data?.id,
            };
        }

        return {
            success: false,
            message: result.message || "Failed to create student",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create student error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}
// ========================= TYPES =========================

export interface StudentMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Student {
    id: number;
    userId: number | null;
    admissionNumber: string;
    fullName: string;
    fatherName: string | null;   // ✅ NEW
    motherName: string | null;   // ✅ NEW
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    phone: string | null;
    address: string | null;
    photo: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        email: string;
        role: string;
        isEmailVerified: boolean;
        lastLogin: string | null;
    } | null;
    enrollments?: StudentEnrollment[];
}

export interface StudentFilters {
    searchTerm?: string;
    departmentId?: string | number;
    groupId?: string | number;
    gender?: string;
    isDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}



interface GetAllStudentsFilters {
    search?: string;
    page?: number;
    limit?: number;
    gender?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getAllStudents(filters: GetAllStudentsFilters = {}) {
    try {
        const { search, page = 1, limit = 10, gender, isActive, sortBy, sortOrder } = filters;

        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (gender) params.set("gender", gender);
        if (isActive !== undefined) params.set("isActive", String(isActive));
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const response = await serverFetch.get(`/students?${params.toString()}`, {
            next: { tags: ["students-list"] },
        });

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data as Student[],
                meta: result.meta as StudentMeta,
            };
        }

        return {
            success: false,
            message: result.message || "শিক্ষার্থীদের তালিকা আনতে ব্যর্থ হয়েছে",
            data: [] as Student[],
            meta: null,
        };
    } catch (error: any) {
        console.error("Get all students error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: [] as Student[],
            meta: null,
        };
    }
}

export async function getStudentById(id: number) {
    try {
        const response = await serverFetch.get(`/students/${id}`, {
            next: {
                tags: [`student-${id}`],
            },
        });

        const result = await response.json();

        if (!result.success) {
            return {
                success: false,
                message: result.message || "Student not found",
            };
        }

        return {
            success: true,
            data: result.data as Student,
        };
    } catch (error: any) {
        console.error("Get student by id error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}

// ========================= UPDATE STUDENT =========================

export async function updateStudent(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id") as string;
        if (!id) return { success: false, message: "Student ID is required" };

        const payload: Record<string, any> = {};
        const fields = ["fullName", "fatherName", "motherName", "gender", "dateOfBirth", "phone", "address"];   // ✅ UPDATED

        for (const field of fields) {
            const val = formData.get(field);
            if (val !== null && val !== "") {
                payload[field] = val;
            }
        }

        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(payload));

        const file = formData.get("file");
        if (file instanceof File && file.size > 0 && file.name !== "undefined") {
            newFormData.append("file", file);
        }

        const response = await serverFetch.patch(`/students/${id}`, {
            body: newFormData,
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag(`student-${id}`, "max");
            return { success: true, message: "শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!" };
        }

        return {
            success: false,
            message: result.message || "Failed to update student",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update student error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}


export async function deleteStudent(id: number) {
    try {
        const response = await serverFetch.delete(`/students/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag("admin-dashboard-meta", "max");
            return { success: true, message: "Student deleted successfully!" };
        }

        return {
            success: false,
            message: result.message || "Failed to delete student",
        };
    } catch (error: any) {
        console.error("Delete student error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}


export async function updateProfile(prevState: any, formData: FormData) {
    try {

        const role = formData.get("role") as string;

        if (!role || !["STUDENT", "TEACHER"].includes(role)) {
            return {
                success: false,
                message: "Invalid user role",
            };
        }

        // ── Build payload based on role ─────────────────────────────────────
        const payload: Record<string, any> = {};

        if (role === "TEACHER") {
            const teacherFields = ["name", "mobile", "designation", "departmentId"];

            for (const field of teacherFields) {
                const val = formData.get(field);
                if (val !== null && val !== "") {
                    payload[field] = val;
                }
            }

            // Wrap for backend
            const backendPayload = {
                teacher: payload
            };

            const newFormData = new FormData();
            newFormData.append("data", JSON.stringify(backendPayload));

            // Handle profile photo
            const file = formData.get("file") as File | null;
            if (file && file.size > 0) {
                newFormData.append("file", file);
            }

            // Call the single update API
            const response = await serverFetch.patch("/users/update-profile", {
                body: newFormData,
            });

            const result = await response.json();

            if (result.success) {
                revalidateTag("teacher-profile", "max");
                revalidateTag(`teacher-${formData.get("id")}`, "max");
                return {
                    success: true,
                    message: "Teacher profile updated successfully!",
                };
            }

            return {
                success: false,
                message: result.message || "Failed to update teacher profile",
                errors: result.errors || {},
            };

        } else if (role === "STUDENT") {
            const studentFields = [
                "name", "mobile", "gender", "birthDate", "birthnumber",
                "nid", "fatherName", "motherName", "fatherMobile",
                "motherMobile", "presentAddress", "permanentAddress",
            ];

            for (const field of studentFields) {
                const val = formData.get(field);
                if (val !== null && val !== "") {
                    payload[field] = val;
                }
            }

            // Wrap for backend (as expected by our API)
            const backendPayload = {
                student: payload
            };

            const newFormData = new FormData();
            newFormData.append("data", JSON.stringify(backendPayload));

            // Handle profile photo
            const file = formData.get("file") as File | null;
            if (file && file.size > 0) {
                newFormData.append("file", file);
            }

            const response = await serverFetch.patch("/users/update-profile", {
                body: newFormData,
            });

            const result = await response.json();

            if (result.success) {
                revalidateTag("students-list", "max");
                revalidateTag(`student-${formData.get("id") || "profile"}`, "max");
                return {
                    success: true,
                    message: "Student profile updated successfully!",
                };
            }

            return {
                success: false,
                message: result.message || "Failed to update student profile",
                errors: result.errors || {},
            };
        }

        return { success: false, message: "Invalid role" };

    } catch (error: any) {
        console.error("Update profile error:", error);

        return {
            success: false,
            message: process.env.NODE_ENV === "development"
                ? error.message
                : "Something went wrong. Please try again.",
        };
    }
}