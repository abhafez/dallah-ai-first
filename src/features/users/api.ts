import { axiosInstance } from "@/lib/axios";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  BulkUploadResponse,
  Enrollment,
  AttendanceRecord,
  CreateEnrollmentPayload,
  ReplaceEnrollmentPayload,
} from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// User CRUD
// ──────────────────────────────────────────────────────────────────────────────

export async function createUserApi(payload: CreateUserPayload): Promise<User> {
  const { data } = await axiosInstance.post<User>("/users", payload);
  return data;
}

export async function searchUsersApi(query: string): Promise<User[]> {
  const { data } = await axiosInstance.get<User[]>("/users/search", {
    params: { q: query },
  });
  return data;
}

export async function updateUserApi(
  userId: string,
  payload: UpdateUserPayload
): Promise<User> {
  const { data } = await axiosInstance.put<User>(`/users/${userId}`, payload);
  return data;
}

export async function bulkUploadUsersApi(
  file: File
): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post<BulkUploadResponse>(
    "/users/bulk",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// Enrollments
// ──────────────────────────────────────────────────────────────────────────────

export async function getUserEnrollmentsApi(
  userId: string
): Promise<Enrollment[]> {
  const { data } = await axiosInstance.get<Enrollment[]>(
    `/users/${userId}/enrollments`
  );
  return data;
}

export async function createEnrollmentApi(
  payload: CreateEnrollmentPayload
): Promise<Enrollment> {
  const { data } = await axiosInstance.post<Enrollment>(
    "/enrollments",
    payload
  );
  return data;
}

export async function deleteEnrollmentApi(
  enrollmentId: string
): Promise<void> {
  await axiosInstance.delete(`/enrollments/${enrollmentId}`);
}

export async function replaceEnrollmentApi(
  payload: ReplaceEnrollmentPayload
): Promise<Enrollment> {
  const { data } = await axiosInstance.post<Enrollment>(
    "/enrollments/replace",
    payload
  );
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// Attendance
// ──────────────────────────────────────────────────────────────────────────────

export async function getAttendanceApi(): Promise<AttendanceRecord[]> {
  const { data } = await axiosInstance.get<AttendanceRecord[]>("/attendance");
  return data;
}
