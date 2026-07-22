import { z } from "zod";

export const createSubjectZodSchema = z
    .object({
        code: z.string({ error: "বিষয় কোড আবশ্যক" }).min(1, { error: "বিষয় কোড আবশ্যক" }),
        name: z.string({ error: "বিষয়ের নাম আবশ্যক" }).min(1, { error: "বিষয়ের নাম আবশ্যক" }),
        fullMarks: z.coerce.number({ error: "পূর্ণ নম্বর আবশ্যক" }).positive(),
        passMarks: z.coerce.number({ error: "পাস নম্বর আবশ্যক" }).positive(),
        credit: z.coerce.number().optional(),
        isOptional: z.boolean().optional(),
        classId: z.coerce.number({ error: "ক্লাস নির্বাচন করুন" }).int().positive({ error: "ক্লাস নির্বাচন করুন" }), // 👈 নতুন
    })
    .refine((data) => data.passMarks <= data.fullMarks, {
        error: "পাস নম্বর পূর্ণ নম্বরের চেয়ে বেশি হতে পারবে না",
        path: ["passMarks"],
    });

export const updateSubjectZodSchema = z.object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    fullMarks: z.coerce.number().positive().optional(),
    passMarks: z.coerce.number().positive().optional(),
    credit: z.coerce.number().optional(),
    isOptional: z.boolean().optional(),
});

export const subjectZodSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    fullMarks: z.number(),
    passMarks: z.number(),
    credit: z.number().nullable(),
    isOptional: z.boolean(),
});

export const getSubjectsResponseZodSchema = z.array(subjectZodSchema);