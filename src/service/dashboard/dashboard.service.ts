/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

export interface ISummaryCard {
    totalStudents: number;
    totalUsers: number;
    totalTeachers: number;
    totalAdmins: number;
    totalClasses: number;
    totalSections: number;
    totalSubjects: number;
    totalExams: number;
    publishedExams: number;
    totalResults: number;
    publishedResults: number;
    currentAcademicYear: string | null;
}

export interface IChartDataPoint {
    label: string;
    value: number;
}

export interface IGenderDistribution {
    male: number;
    female: number;
    other: number;
}

export interface ISmsStats {
    pending: number;
    sent: number;
    failed: number;
    delivered: number;
}

export interface IAdminDashboardMeta {
    summary: ISummaryCard;
    enrollmentByClass: IChartDataPoint[];
    gradeDistribution: IChartDataPoint[];
    genderDistribution: IGenderDistribution;
    smsStats: ISmsStats;
    resultPublishStatus: {
        published: number;
        unpublished: number;
    };
    userRoleDistribution: IChartDataPoint[];
}

export async function getAdminDashboardMeta(): Promise<{
    success: boolean;
    data: IAdminDashboardMeta | null;
    message?: string;
}> {
    try {
        const response = await serverFetch.get("/dashboard/admin/summary", {
            next: {
                tags: ["admin-dashboard-meta"],
                revalidate: 1800, // 30 minutes
            },
        });

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data as IAdminDashboardMeta,
            };
        }

        return {
            success: false,
            data: null,
            message: result.message || "ড্যাশবোর্ড তথ্য আনতে ব্যর্থ হয়েছে",
        };
    } catch (error: any) {
        console.error("Get admin dashboard meta error:", error);

        return {
            success: false,
            data: null,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}