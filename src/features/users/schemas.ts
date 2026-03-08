import * as z from "zod";

// ──────────────────────────────────────────────────────────────────────────────
// Saudi mobile number: starts with 05, 10 digits total
// ──────────────────────────────────────────────────────────────────────────────
const saudiMobileRegex = /^05\d{8}$/;

// ──────────────────────────────────────────────────────────────────────────────
// National ID: exactly 10 digits
// ──────────────────────────────────────────────────────────────────────────────
const nationalIdRegex = /^\d{10}$/;

// ──────────────────────────────────────────────────────────────────────────────
// Add User Schema
// ──────────────────────────────────────────────────────────────────────────────
export const addUserSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  mobile: z.string().regex(saudiMobileRegex, "mobileInvalid"),
  nationalId: z.string().regex(nationalIdRegex, "nationalIdInvalid"),
  language: z.enum(["ar", "en"], { message: "languageRequired" }),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    message: "levelRequired",
  }),
  vehicle: z.enum(["sedan", "suv", "truck", "bus", "motorcycle"], {
    message: "vehicleRequired",
  }),
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
  language: z.enum(["ar", "en"], { message: "languageRequired" }),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    message: "levelRequired",
  }),
  vehicle: z.enum(["sedan", "suv", "truck", "bus", "motorcycle"], {
    message: "vehicleRequired",
  }),
});

export type CreateEnrollmentFormValues = z.infer<typeof createEnrollmentSchema>;
