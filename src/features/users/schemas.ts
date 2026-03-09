import * as z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// ──────────────────────────────────────────────────────────────────────────────
// National ID: exactly 10 digits, starts with 1 or 2
// ──────────────────────────────────────────────────────────────────────────────
const nationalIdRegex = /^[12]\d{9}$/;

// ──────────────────────────────────────────────────────────────────────────────
// Add User Schema
// ──────────────────────────────────────────────────────────────────────────────
export const addUserSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  mobile: z.string().refine(
    (val) => isValidPhoneNumber(val, "SA"),
    "mobileInvalid",
  ),
  national_id: z.string().regex(nationalIdRegex, "nationalIdInvalid"),
  school_id: z.coerce.number().min(1, "schoolRequired"),
  lang: z.string().min(1, "languageRequired"),
  course_code: z.string().min(1, "courseRequired"),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Update User Schema
// ──────────────────────────────────────────────────────────────────────────────
export const updateUserSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  mobile: z.string().refine(
    (val) => isValidPhoneNumber(val, "SA"),
    "mobileInvalid",
  ),
  lang: z.string().min(1, "languageRequired"),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Create Enrollment Schema
// ──────────────────────────────────────────────────────────────────────────────
export const createEnrollmentSchema = z.object({
  lang: z.string().min(1, "languageRequired"),
  licence_type: z.enum(["private", "motor", "public"], {
    message: "licenceTypeRequired",
  }),
  dallah_course_code: z.string().min(1, "courseRequired"),
});

export type CreateEnrollmentFormValues = z.infer<typeof createEnrollmentSchema>;
