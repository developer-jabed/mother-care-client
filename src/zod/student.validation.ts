import { z } from "zod";

export const createStudentZodSchema = z.object({
  email: z.string({ error: "Email is required" }).email({ error: "Invalid email" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),
  fullName: z.string({ error: "Full name is required" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { error: "Gender is required" }),
  dateOfBirth: z.string({ error: "Date of birth is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});