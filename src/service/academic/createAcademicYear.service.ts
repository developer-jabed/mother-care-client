/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createAcademicYearZodSchema, createClassZodSchema, createSectionZodSchema } from "@/zod/academic.validation";
import { revalidateTag } from "next/cache";

export async function createAcademicYear(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            title: formData.get("title") as string,
            startDate: formData.get("startDate") as string,
            endDate: formData.get("endDate") as string,
            isCurrent: formData.get("isCurrent") === "true",
        };

        const validated = zodValidator(validationPayload, createAcademicYearZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/academic-years/create-academic-year", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("academic-years-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "শিক্ষাবর্ষ সফলভাবে তৈরি হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "শিক্ষাবর্ষ তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create academic year error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}


export async function getCurrentAcademicYear() {
    try {
        const response = await serverFetch.get("/academic-years/current", {
            next: { tags: ["academic-years-list"] },
        });

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data,
            };
        }

        return {
            success: false,
            message: result.message || "চলতি শিক্ষাবর্ষ পাওয়া যায়নি",
            data: null,
        };
    } catch (error: any) {
        console.error("Get current academic year error:", error);

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


export async function createClass(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            name: formData.get("name") as string,
            numericOrder: formData.get("numericOrder") as string,
        };

        const validated = zodValidator(validationPayload, createClassZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/classes/create-class", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("classes-list", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "ক্লাস সফলভাবে তৈরি হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "ক্লাস তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create class error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}



export async function createSection(prevState: any, formData: FormData) {
    try {
        const validationPayload = {
            classId: formData.get("classId") as string,
            name: formData.get("name") as string,
            capacity: formData.get("capacity") as string,
        };

        const validated = zodValidator(validationPayload, createSectionZodSchema);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        const data = validated.data!;

        const response = await serverFetch.post("/classes/create-section", {
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("sections-list", "max");
            revalidateTag("classes-list", "max"); // class includes sections, so refresh both
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "শাখা সফলভাবে তৈরি হয়েছে!",
            };
        }

        return {
            success: false,
            message: result.message || "শাখা তৈরি করতে ব্যর্থ হয়েছে",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Create section error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}



export interface ClassSection {
    id: number;
    classId: number;
    name: string;
    capacity: number | null;
}

export interface ClassWithSections {
    id: number;
    name: string;
    numericOrder: number | null;
    sections: ClassSection[];
    _count: {
        enrollments: number;
    };
}

export async function getClasses(): Promise<ClassWithSections[]> {
    try {
        const response = await serverFetch.get("/classes/classes", {
            next: { tags: ["classes-list"] },
        });

        const result = await response.json();

        if (result.success) {
            return result.data as ClassWithSections[];
        }

        return [];
    } catch (error) {
        console.error("Get classes error:", error);
        return [];
    }
}



export async function getAllAcademicYears() {
    try {
        const response = await serverFetch.get("/academic-years", {
            next: { tags: ["academic-years-list"] },
        });

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data,
            };
        }

        return {
            success: false,
            message: result.message || "শিক্ষাবর্ষের তালিকা আনতে ব্যর্থ হয়েছে",
            data: [],
        };
    } catch (error: any) {
        console.error("Get all academic years error:", error);

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


export async function getAllSections() {
    try {
        const response = await serverFetch.get("/sections", {
            next: { tags: ["sections-list"] },
        });

        const result = await response.json();

        return result.success
            ? { success: true, data: result.data }
            : { success: false, data: [], message: result.message || "শাখা তালিকা আনতে ব্যর্থ হয়েছে" };
    } catch (error: any) {
        console.error("Get all sections error:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}

export async function getSectionsByClass(classId: string | number) {
    try {
        const response = await serverFetch.get(`/sections/class/${classId}`, {
            next: { tags: [`sections-list-${classId}`] },
        });

        const result = await response.json();

        return result.success
            ? { success: true, data: result.data }
            : { success: false, data: [], message: result.message || "শাখা তালিকা আনতে ব্যর্থ হয়েছে" };
    } catch (error: any) {
        console.error("Get sections by class error:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        };
    }
}