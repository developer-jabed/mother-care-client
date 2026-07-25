import { z } from "zod";

export const resultCardBatchSchema = z.object({
    classId: z
        .number({ error: "ক্লাস আইডি আবশ্যক" })
        .int()
        .positive({ error: "সঠিক ক্লাস আইডি দিন" }),
    sectionId: z
        .number({ error: "সেকশন আইডি আবশ্যক" })
        .int()
        .positive({ error: "সঠিক সেকশন আইডি দিন" }),
    examId: z
        .number({ error: "পরীক্ষার আইডি আবশ্যক" })
        .int()
        .positive({ error: "সঠিক পরীক্ষার আইডি দিন" }),
    onlyEnrollmentIds: z
        .array(z.number().int().positive())
        .min(1, { error: "কমপক্ষে একটি এনরোলমেন্ট আইডি দিতে হবে" })
        .optional(),
});

export type ResultCardBatchSchema = z.infer<typeof resultCardBatchSchema>;

export const resultCardValidation = {
    resultCardBatchSchema,
};