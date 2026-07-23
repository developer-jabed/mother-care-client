/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export interface ExamScheduleExam {
    id: number;
    name: string;
}

export interface ExamScheduleSubject {
    id: number;
    name: string;
}

export interface ExamScheduleClass {
    id: number;
    name: string;
}

export interface ExamSchedule {
    id: number;
    examId: number;
    subjectId: number;
    classId: number;
    sectionId: number | null;
    examDate: string;
    startTime: string;
    endTime: string;
    roomNumber: string | null;
    exam: ExamScheduleExam;
    subject: ExamScheduleSubject;
    class: ExamScheduleClass;
}

export interface CreateExamScheduleInput {
    examId: number;
    subjectId: number;
    classId: number;
    sectionId?: number | null;
    examDate: string;
    startTime: string;
    endTime: string;
    roomNumber?: string | null;
}

export interface UpdateExamScheduleInput {
    examId?: number;
    subjectId?: number;
    classId?: number;
    sectionId?: number | null;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    roomNumber?: string | null;
}

export interface ExamScheduleFilters {
    examId?: number;
    classId?: number;
    sectionId?: number;
    subjectId?: number;
}

export async function createExamSchedule(payload: CreateExamScheduleInput) {
    try {
        const response = await serverFetch.post("/exam-schedules", {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-schedules-list", "max");

            return {
                success: true,
                message: result.message || "পরীক্ষার সময়সূচী তৈরি হয়েছে!",
                data: result.data as ExamSchedule,
            };
        }

        return {
            success: false,
            message: result.message || "সময়সূচী তৈরি করতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Create exam schedule error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function getExamSchedules(filters: ExamScheduleFilters = {}) {
    try {
        const searchParams = new URLSearchParams();

        if (filters.examId) searchParams.set("examId", String(filters.examId));
        if (filters.classId) searchParams.set("classId", String(filters.classId));
        if (filters.sectionId) searchParams.set("sectionId", String(filters.sectionId));
        if (filters.subjectId) searchParams.set("subjectId", String(filters.subjectId));

        const query = searchParams.toString();
        const response = await serverFetch.get(`/exam-schedules${query ? `?${query}` : ""}`, {
            next: { tags: ["exam-schedules-list"] },
        });

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                message: result.message || "সময়সূচী পাওয়া গেছে",
                data: result.data as ExamSchedule[],
            };
        }

        return {
            success: false,
            message: result.message || "সময়সূচী পাওয়া যায়নি",
            data: [] as ExamSchedule[],
        };
    } catch (error: any) {
        console.error("Get exam schedules error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
            data: [] as ExamSchedule[],
        };
    }
}

export async function getExamScheduleById(id: number) {
    try {
        const response = await serverFetch.get(`/exam-schedules/${id}`);
        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                message: result.message || "সময়সূচী পাওয়া গেছে",
                data: result.data as ExamSchedule,
            };
        }

        return {
            success: false,
            message: result.message || "সময়সূচী পাওয়া যায়নি",
        };
    } catch (error: any) {
        console.error("Get exam schedule by id error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function updateExamSchedule(id: number, payload: UpdateExamScheduleInput) {
    try {
        const response = await serverFetch.patch(`/exam-schedules/${id}`, {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-schedules-list", "max");

            return {
                success: true,
                message: result.message || "সময়সূচী আপডেট হয়েছে!",
                data: result.data as ExamSchedule,
            };
        }

        return {
            success: false,
            message: result.message || "সময়সূচী আপডেট করতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Update exam schedule error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function deleteExamSchedule(id: number) {
    try {
        const response = await serverFetch.delete(`/exam-schedules/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("exam-schedules-list", "max");

            return {
                success: true,
                message: result.message || "সময়সূচী মুছে ফেলা হয়েছে!",
                data: result.data as ExamSchedule,
            };
        }

        return {
            success: false,
            message: result.message || "সময়সূচী মুছতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Delete exam schedule error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}