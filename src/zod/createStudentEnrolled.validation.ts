import { z } from "zod";

export const createStudentEnrollmentZodSchema = z.object({
    studentId: z.coerce
        .number({ error: "শিক্ষার্থী নির্বাচন করুন" })
        .int()
        .positive({ error: "শিক্ষার্থী নির্বাচন করুন" }),

    academicYearId: z.coerce
        .number({ error: "শিক্ষাবর্ষ নির্বাচন করুন" })
        .int()
        .positive({ error: "শিক্ষাবর্ষ নির্বাচন করুন" }),

    classId: z.coerce
        .number({ error: "ক্লাস নির্বাচন করুন" })
        .int()
        .positive({ error: "ক্লাস নির্বাচন করুন" }),

    sectionId: z.coerce
        .number({ error: "শাখা নির্বাচন করুন" })
        .int()
        .positive({ error: "শাখা নির্বাচন করুন" }),

    rollNumber: z.coerce
        .number({ error: "রোল নম্বর আবশ্যক" })
        .int()
        .positive({ error: "সঠিক রোল নম্বর দিন" }),
});

export type CreateStudentEnrollmentInput = z.infer<typeof createStudentEnrollmentZodSchema>;

export const updateStudentEnrollmentZodSchema = z.object({
    academicYearId: z.coerce
        .number({ error: "শিক্ষাবর্ষ নির্বাচন করুন" })
        .int()
        .positive({ error: "শিক্ষাবর্ষ নির্বাচন করুন" })
        .optional(),

    classId: z.coerce
        .number({ error: "ক্লাস নির্বাচন করুন" })
        .int()
        .positive({ error: "ক্লাস নির্বাচন করুন" })
        .optional(),

    sectionId: z.coerce
        .number({ error: "শাখা নির্বাচন করুন" })
        .int()
        .positive({ error: "শাখা নির্বাচন করুন" })
        .optional(),

    rollNumber: z.coerce
        .number({ error: "রোল নম্বর আবশ্যক" })
        .int()
        .positive({ error: "সঠিক রোল নম্বর দিন" })
        .optional(),

    status: z
        .enum(["ACTIVE", "PROMOTED", "TRANSFERRED", "DROPPED", "GRADUATED"], {
            error: "সঠিক স্ট্যাটাস নির্বাচন করুন",
        })
        .optional(),
});

export type UpdateStudentEnrollmentInput = z.infer<typeof updateStudentEnrollmentZodSchema>;

export const promoteStudentZodSchema = z.object({
    studentId: z.coerce
        .number({ error: "শিক্ষার্থী নির্বাচন করুন" })
        .int()
        .positive({ error: "শিক্ষার্থী নির্বাচন করুন" }),

    newAcademicYearId: z.coerce
        .number({ error: "নতুন শিক্ষাবর্ষ নির্বাচন করুন" })
        .int()
        .positive({ error: "নতুন শিক্ষাবর্ষ নির্বাচন করুন" }),

    newClassId: z.coerce
        .number({ error: "নতুন ক্লাস নির্বাচন করুন" })
        .int()
        .positive({ error: "নতুন ক্লাস নির্বাচন করুন" }),

    newSectionId: z.coerce
        .number({ error: "নতুন শাখা নির্বাচন করুন" })
        .int()
        .positive({ error: "নতুন শাখা নির্বাচন করুন" }),

    newRollNumber: z.coerce
        .number({ error: "নতুন রোল নম্বর আবশ্যক" })
        .int()
        .positive({ error: "সঠিক রোল নম্বর দিন" }),
});



export type PromoteStudentInput = z.infer<typeof promoteStudentZodSchema>;

export const performanceRankingQueryZodSchema = z.object({
    academicYearId: z.coerce
        .number({ error: "শিক্ষাবর্ষ নির্বাচন করুন" })
        .int()
        .positive({ error: "শিক্ষাবর্ষ নির্বাচন করুন" }),

    classId: z.coerce
        .number({ error: "ক্লাস নির্বাচন করুন" })
        .int()
        .positive({ error: "ক্লাস নির্বাচন করুন" }),

    sectionId: z.coerce
        .number({ error: "শাখা নির্বাচন করুন" })
        .int()
        .positive({ error: "শাখা নির্বাচন করুন" }),
});

export type PerformanceRankingQueryInput = z.infer<typeof performanceRankingQueryZodSchema>;

export const bulkPromoteZodSchema = z.object({
    sourceAcademicYearId: z.coerce.number().int().positive({ error: "উৎস শিক্ষাবর্ষ আবশ্যক" }),
    sourceClassId: z.coerce.number().int().positive({ error: "উৎস ক্লাস আবশ্যক" }),
    sourceSectionId: z.coerce.number().int().positive({ error: "উৎস শাখা আবশ্যক" }),
    targetAcademicYearId: z.coerce.number().int().positive({ error: "নতুন শিক্ষাবর্ষ নির্বাচন করুন" }),
    targetClassId: z.coerce.number().int().positive({ error: "নতুন ক্লাস নির্বাচন করুন" }),
    targetSectionId: z.coerce.number().int().positive({ error: "নতুন শাখা নির্বাচন করুন" }),
    promotions: z
        .array(
            z.object({
                studentId: z.coerce.number().int().positive(),
                newRollNumber: z.coerce.number().int().positive(),
            })
        )
        .min(1, { error: "অন্তত একজন শিক্ষার্থী নির্বাচন করুন" }),
});

export type BulkPromoteInput = z.infer<typeof bulkPromoteZodSchema>;