import { z } from "zod";

const percentageField = z.coerce
    .number({ error: "সংখ্যা দিন" })
    .min(0, "০ এর কম হতে পারবে না")
    .max(100, "১০০ এর বেশি হতে পারবে না");

const gradePointField = z.coerce
    .number({ error: "সংখ্যা দিন" })
    .min(0, "০ এর কম হতে পারবে না")
    .max(5, "সাধারণত ৫.০০ এর বেশি হয় না");

export const createGradingScaleZodSchema = z
    .object({
        academicYearId: z.coerce.number({ error: "শিক্ষাবর্ষ নির্বাচন করুন" }).int().positive("সঠিক শিক্ষাবর্ষ নির্বাচন করুন"),
        grade: z.string({ error: "গ্রেড দিন" }).trim().min(1, "গ্রেড আবশ্যক").max(10, "গ্রেড অনেক বড়"),
        minPercentage: percentageField,
        maxPercentage: percentageField,
        gradePoint: gradePointField, // required — matches schema (no `?`)
    })
    .refine((data) => data.minPercentage <= data.maxPercentage, {
        message: "সর্বনিম্ন শতাংশ সর্বোচ্চ শতাংশের চেয়ে বেশি হতে পারবে না",
        path: ["minPercentage"],
    });

export const updateGradingScaleZodSchema = z
    .object({
        grade: z.string().trim().min(1, "গ্রেড আবশ্যক").max(10, "গ্রেড অনেক বড়").optional(),
        minPercentage: percentageField.optional(),
        maxPercentage: percentageField.optional(),
        gradePoint: gradePointField.optional(),
    })
    .refine(
        (data) =>
            data.minPercentage === undefined ||
            data.maxPercentage === undefined ||
            data.minPercentage <= data.maxPercentage,
        {
            message: "সর্বনিম্ন শতাংশ সর্বোচ্চ শতাংশের চেয়ে বেশি হতে পারবে না",
            path: ["minPercentage"],
        }
    );

export type CreateGradingScaleInput = z.infer<typeof createGradingScaleZodSchema>;
export type UpdateGradingScaleInput = z.infer<typeof updateGradingScaleZodSchema>;