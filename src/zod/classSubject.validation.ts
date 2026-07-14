import { z } from "zod";

export const createClassSubjectZodSchema = z.object({
    classId: z.coerce.number({ error: "ক্লাস নির্বাচন করুন" }).int().positive(),
    sectionId: z.coerce.number().int().positive().optional(),
    subjectId: z.coerce.number({ error: "বিষয় নির্বাচন করুন" }).int().positive(),
});

export const updateClassSubjectZodSchema = z.object({
    classId: z.coerce.number().int().positive().optional(),
    sectionId: z.coerce.number().int().positive().optional(),
    subjectId: z.coerce.number().int().positive().optional(),
});

const classZodSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const sectionZodSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const subjectZodSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
});

export const classSubjectZodSchema = z.object({
    id: z.number(),
    classId: z.number(),
    sectionId: z.number().nullable(),
    subjectId: z.number(),
    class: classZodSchema,
    section: sectionZodSchema.nullable(),
    subject: subjectZodSchema,
});

export const getClassSubjectsResponseZodSchema = z.array(classSubjectZodSchema);

// ── New: full Subject shape returned by GET /class-subjects/subjects ──────
// Includes fullMarks/passMarks since the mark-entry sheet needs them for
// grading display; the leaner `subjectZodSchema` above only covers what the
// ClassSubject admin table needs.
const subjectFullZodSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    fullMarks: z.number(),
    passMarks: z.number(),
    credit: z.number().nullable(),
    isOptional: z.boolean(),
});

export const getSubjectsForClassSectionResponseZodSchema = z.array(subjectFullZodSchema);