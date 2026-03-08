// ──────────────────────────────────────────────────────────────────────────────
// Shared types for Users, Enrollments, and related entities
// ──────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  mobile: string;
  nationalId: string;
  language: Language;
  level: Level;
  vehicle: Vehicle;
  branch?: string;
  createdAt?: string;
}

export interface CreateUserPayload {
  name: string;
  mobile: string;
  nationalId: string;
  language: Language;
  level: Level;
  vehicle: Vehicle;
}

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  nationalId?: string;
  language?: Language;
  branch?: string;
}

export interface BulkUploadRow {
  name: string;
  mobile: string;
  nationalId: string;
  language: string;
  level: string;
  vehicle: string;
}

export interface BulkUploadResultRow {
  row: number;
  name: string;
  nationalId: string;
  status: "success" | "error";
  message?: string;
}

export interface BulkUploadResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: BulkUploadResultRow[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseTitle: string;
  courseId: string;
  language: Language;
  level: Level;
  vehicle: Vehicle;
  createdAt: string;
}

export interface CreateEnrollmentPayload {
  userId: string;
  language: Language;
  level: Level;
  vehicle: Vehicle;
}

export interface ReplaceEnrollmentPayload {
  enrollmentId: string;
  userId: string;
  language: Language;
  level: Level;
  vehicle: Vehicle;
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
