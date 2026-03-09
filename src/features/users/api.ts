import { axiosInstance } from "@/lib/axios";
import type {
  User,
  ApiUser,
  CreateUserPayload,
  UpdateUserPayload,
  BulkUploadResponse,
  AttendanceRecord,
  NotificationsResponse,
  CreateEnrollmentPayload,
  DeleteEnrollmentPayload,
  ReplaceEnrollmentPayload,
  ApiLanguage,
  ApiCourse,
  ApiBranch,
} from "./types";

const LANG_NAME_TO_CODE: Record<string, string> = {
  arabic: "1",
  english: "2",
  ardu: "3",
  hendi: "4",
};

export function langNameToCode(langName: string): string {
  return LANG_NAME_TO_CODE[langName.toLowerCase()] ?? "1";
}

function mapApiUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    mobile: u.mobile_number,
    nationalId: u.national_id,
    language: u.lang || "",
    level: "",
    vehicle: "",
    status: u.status,
    enrollments: u.enrollments,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// User CRUD
// ──────────────────────────────────────────────────────────────────────────────

export async function createUserApi(payload: CreateUserPayload): Promise<User> {
  const { data } = await axiosInstance.post<ApiUser>("/users", payload);
  return mapApiUser(data);
}

export async function listUsersApi(): Promise<User[]> {
  const { data } = await axiosInstance.get<{ users: ApiUser[] }>("/users");
  return data.users.map(mapApiUser);
}

export async function searchUsersApi(query: string): Promise<User[]> {
  const { data } = await axiosInstance.get<{ users: ApiUser[] }>("/users", {
    params: { q: query },
  });
  return data.users.map(mapApiUser);
}

export async function updateUserApi(payload: UpdateUserPayload): Promise<User> {
  const { data } = await axiosInstance.patch<ApiUser>("/users", payload);
  return mapApiUser(data);
}

export async function bulkUploadUsersApi(
  file: File
): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post<BulkUploadResponse>(
    "/users/bulk_csv",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function downloadBulkCsvTemplateApi(): Promise<void> {
  const { data } = await axiosInstance.get("/users/bulk_csv/template", {
    responseType: "blob",
  });
  const blob = data instanceof Blob ? data : new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bulk_upload_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────────────────────────────
// Enrollments
// ──────────────────────────────────────────────────────────────────────────────

export async function createEnrollmentApi(
  payload: CreateEnrollmentPayload
): Promise<void> {
  await axiosInstance.post("/enrollments", {
    national_id: payload.national_id,
    courses: [
      {
        dallah_course_code: payload.dallah_course_code,
        lang: payload.lang,
        licence_type: payload.licence_type,
      },
    ],
  });
}

export async function deleteEnrollmentApi(
  payload: DeleteEnrollmentPayload
): Promise<void> {
  await axiosInstance.delete("/enrollments", {
    data: {
      national_id: payload.national_id,
      courses: [
        {
          dallah_course_code: payload.dallah_course_code,
          lang: payload.lang,
          licence_type: payload.licence_type,
        },
      ],
    },
  });
}

export async function replaceEnrollmentApi(
  payload: ReplaceEnrollmentPayload
): Promise<void> {
  await axiosInstance.post("/enrollments/replace", {
    national_id: payload.national_id,
    courses: [
      {
        old: payload.old,
        new: payload.new,
      },
    ],
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Attendance
// ──────────────────────────────────────────────────────────────────────────────

export async function getAttendanceApi(): Promise<AttendanceRecord[]> {
  const { data } = await axiosInstance.get<AttendanceRecord[]>("/attendance");
  return data;
}

export async function getNotificationsApi(): Promise<NotificationsResponse> {
  const { data } = await axiosInstance.get<NotificationsResponse>("/notifications");
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// Lookups (languages, courses, branches)
// ──────────────────────────────────────────────────────────────────────────────

export async function getLanguagesApi(): Promise<ApiLanguage[]> {
  const { data } = await axiosInstance.get<{ languages: ApiLanguage[] }>("/languages");
  return data.languages;
}

export async function getCoursesApi(): Promise<ApiCourse[]> {
  const { data } = await axiosInstance.get<{ courses: ApiCourse[] }>("/courses");
  return data.courses;
}

export async function getBranchesApi(): Promise<ApiBranch[]> {
  const { data } = await axiosInstance.get<{ branches: ApiBranch[] }>("/branches");
  return data.branches;
}
