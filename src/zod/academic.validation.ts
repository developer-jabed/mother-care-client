import { z } from "zod";

export const createAcademicYearZodSchema = z
    .object({
        title: z.string({ error: "শিক্ষাবর্ষের নাম আবশ্যক" }).min(1, { error: "শিক্ষাবর্ষের নাম আবশ্যক" }),
        startDate: z.string({ error: "শুরুর তারিখ আবশ্যক" }),
        endDate: z.string({ error: "শেষের তারিখ আবশ্যক" }),
        isCurrent: z.boolean().optional(),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        error: "শেষের তারিখ শুরুর তারিখের আগে হতে পারবে না",
        path: ["endDate"],
    });

export const createClassZodSchema = z.object({
    name: z.string({ error: "ক্লাসের নাম আবশ্যক" }).min(1, { error: "ক্লাসের নাম আবশ্যক" }),
    numericOrder: z.coerce.number().optional(),
});

export const createSectionZodSchema = z.object({
    classId: z.coerce.number({ error: "ক্লাস নির্বাচন করুন" }),
    name: z.string({ error: "শাখার নাম আবশ্যক" }).min(1, { error: "শাখার নাম আবশ্যক" }),
    capacity: z.coerce.number().optional(),
});