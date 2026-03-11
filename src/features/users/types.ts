// Shared types for Users, Enrollments, and related entities
// ──────────────────────────────────────────────────────────────────────────────
 
export interface DropdownOption<T extends string> {
  value: T;
  labelEn: string;
  labelAr: string;
}

export interface ApiUserEnrollment {
  id: number;
  status: string;
  course: {
    id: number;
    course_name: string;
    dallah_course_code: string;
    language: string; // "arabic", "english", etc.
    category: "private" | "motor" | "public";
  };
}

export interface ApiUser {
  id: number;
  name: string;
  national_id: string;
  mobile_number: string;
  email: string;
  lang: string;
  status: string;
  organization_branch_id: number;
  enrollments: ApiUserEnrollment[];
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
  status?: string;
  enrollments?: ApiUserEnrollment[];
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
  current_national_id: string;
  name?: string;
  mobile?: string;
  lang?: string;
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
  national_id: string;
  dallah_course_code: string;
  lang: string;
  licence_type: "private" | "motor" | "public";
}

export interface DeleteEnrollmentPayload {
  national_id: string;
  dallah_course_code: string;
  lang: string;
  licence_type: "private" | "motor" | "public";
}

export interface ReplaceEnrollmentPayload {
  national_id: string;
  old: { dallah_course_code: string; lang: string; licence_type: "private" | "motor" | "public" };
  new: { dallah_course_code: string; lang: string; licence_type: "private" | "motor" | "public" };
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

export interface ApiNotificationEnrollment {
  aanaab_user_id: number;
  user_name: string;
  status: "started" | "not_started";
  enrollment_id: number;
  workflow_state: string;
  total_progress: number;
}

export interface ApiNotification {
  id: number;
  event_type: string;
  user_name: string;
  created_at: string;
  enrollment: ApiNotificationEnrollment;
}

export interface NotificationsResponse {
  notifications: ApiNotification[];
  meta: { count: number; has_more: boolean };
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
