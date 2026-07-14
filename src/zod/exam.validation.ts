import { z } from "zod";

/**
 * Adjust these fields to match your actual Exam / ExamType Prisma models —
 * inferred here from ExamService/ExamTypeService (name, academicYearId,
 * examTypeId, startDate, endDate, isPublished for Exam; name for ExamType).
 */

export const createExamZodSchema = z.object({
    name: z.string().min(1, "পরীক্ষার নাম আবশ্যক"),
    academicYearId: z.coerce.number({ error: "শিক্ষাবর্ষ নির্বাচন করুন" }),
    examTypeId: z.coerce.number({ error: "পরীক্ষার ধরন নির্বাচন করুন" }),
    startDate: z.string().min(1, "শুরুর তারিখ আবশ্যক"),
    endDate: z.string().min(1, "শেষের তারিখ আবশ্যক"),
    isPublished: z.coerce.boolean().optional(),
});

export const updateExamZodSchema = createExamZodSchema.partial();

export const getExamsResponseZodSchema = z.array(
    z.object({
        id: z.number(),
        name: z.string(),
        academicYearId: z.number(),
        examTypeId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        isPublished: z.boolean(),
        academicYear: z.object({ id: z.number(), title: z.string() }).optional(),
        examType: z.object({ id: z.number(), name: z.string() }).optional(),
    })
);

export const createExamTypeZodSchema = z.object({
    name: z.string().min(1, "পরীক্ষার ধরনের নাম আবশ্যক"),
});

export const updateExamTypeZodSchema = createExamTypeZodSchema.partial();

export const getExamTypesResponseZodSchema = z.array(
    z.object({
        id: z.number(),
        name: z.string(),
    })
);