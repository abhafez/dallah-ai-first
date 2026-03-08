import * as z from "zod";

// ──────────────────────────────────────────────────────────────────────────────
// Saudi mobile number: starts with 05, 10 digits total
// ──────────────────────────────────────────────────────────────────────────────
// Saudi mobile number: starts with +9665, followed by 8 digits
const saudiMobileRegex = /^\+9665\d{8}$/;

// ──────────────────────────────────────────────────────────────────────────────
// National ID: exactly 10 digits
// ──────────────────────────────────────────────────────────────────────────────
// National ID: exactly 10 digits, starts with 1 or 2
const nationalIdRegex = /^[12]\d{9}$/;

// ──────────────────────────────────────────────────────────────────────────────
// Add User Schema
// ──────────────────────────────────────────────────────────────────────────────
export const addUserSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  mobile: z.string().regex(saudiMobileRegex, "mobileInvalid"),
  national_id: z.string().regex(nationalIdRegex, "nationalIdInvalid"),
  school_id: z.coerce.number().min(1, "schoolRequired"),
  lang: z.string().min(1, "languageRequired"),
  licence_type: z.enum(["private", "motor", "public"], {
    message: "licenceTypeRequired",
  }),
  course_code: z.string().min(1, "courseRequired"),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Update User Schema
// ──────────────────────────────────────────────────────────────────────────────
export const updateUserSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  mobile: z.string().regex(saudiMobileRegex, "mobileInvalid"),
  nationalId: z.string().regex(nationalIdRegex, "nationalIdInvalid"),
  language: z.enum(["ar", "en"]).optional(),
  branch: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Create Enrollment Schema
// ──────────────────────────────────────────────────────────────────────────────
export const createEnrollmentSchema = z.object({
  userId: z.string().min(1),
  lang: z.string().min(1, "languageRequired"),
  licence_type: z.enum(["private", "motor", "public"], {
    message: "licenceTypeRequired",
  }),
  course_code: z.string().min(1, "courseRequired"),
});

export type CreateEnrollmentFormValues = z.infer<typeof createEnrollmentSchema>;
