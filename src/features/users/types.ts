// Shared types for Users, Enrollments, and related entities
// ──────────────────────────────────────────────────────────────────────────────
 
export interface DropdownOption<T extends string> {
  value: T;
  labelEn: string;
  labelAr: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  nationalId: string;
  language: string; // "ar" | "en" for display, but often mapped from "1"-"4"
  level: string; // maps to course_code
  vehicle: string; // maps to licence_type
  branch?: string;
  createdAt?: string;
}

export interface CreateUserPayload {
  name: string;
  mobile: string; // Must be +966XXXXXXXXX
  national_id: string; // Exactly 10 digits, starts with 1 or 2
  school_id: number;
  lang: string; // "1", "2", "3", "4"
  courses: Array<{
    dallah_course_code: string;
    licence_type: "private" | "motor" | "public";
    lang?: string;
  }>;
}

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  nationalId?: string;
  language?: Language;
  branch?: string;
}

export interface BulkUploadResultUser {
  national_id: string;
  aanaab_user_id?: number;
  name?: string;
  [key: string]: unknown;
}

export interface BulkUploadFailedUser {
  national_id: string;
  name?: string;
  errors: string[];
}

export interface BulkUploadResponse {
  message: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: BulkUploadResultUser[];
  failed_users: BulkUploadFailedUser[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseTitle: string;
  courseId: string;
  lang: string;
  licence_type: "private" | "motor" | "public";
  course_code: string;
  createdAt: string;
}

export interface CreateEnrollmentPayload {
  userId: string;
  lang: string;
  licence_type: "private" | "motor" | "public";
  course_code: string;
}

export interface ReplaceEnrollmentPayload {
  enrollmentId: string;
  userId: string;
  lang: string;
  licence_type: "private" | "motor" | "public";
  course_code: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  courseTitle: string;
  status: "started" | "not_started";
  startDate: string | null;
  payloadChangedAt: string;
}

export interface SearchUsersParams {
  q: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Lookup types (from API)
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiLanguage {
  code: string;       // "1", "2", "3", "4"
  name: string;       // "arabic", "english", "ardu", "hendi"
  locale: string;     // "ar", "en", "ur", "hi"
}

export interface ApiCourse {
  id: number;
  course_name: string;
  dallah_course_code: string;
  language: string;   // "arabic", "english", etc.
  category: "private" | "motor" | "public";
}

export interface ApiBranch {
  id: number;
  branch_id: number;
  branch_name: string;
  section_id: number;
  section_name: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Enums / union types for dropdowns
// ──────────────────────────────────────────────────────────────────────────────

export type Language = "ar" | "en";

export type Level =
  | "beginner"
  | "intermediate"
  | "advanced";

export type Vehicle =
  | "sedan"
  | "suv"
  | "truck"
  | "bus"
  | "motorcycle";
