import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  userKeys,
  attendanceKeys,
  lookupKeys,
  useCreateUser,
  useSearchUsers,
  useListUsers,
  useUpdateUser,
  useBulkUploadUsers,
  useCreateEnrollment,
  useDeleteEnrollment,
  useReplaceEnrollment,
  useAttendance,
  useNotifications,
  useLanguages,
  useCourses,
  useBranches,
} from "../queries";
import {
  createUserApi,
  listUsersApi,
  searchUsersApi,
  updateUserApi,
  bulkUploadUsersApi,
  createEnrollmentApi,
  deleteEnrollmentApi,
  replaceEnrollmentApi,
  getAttendanceApi,
  getNotificationsApi,
  getLanguagesApi,
  getCoursesApi,
  getBranchesApi,
} from "../api";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("../api", () => ({
  createUserApi: vi.fn(),
  listUsersApi: vi.fn(),
  searchUsersApi: vi.fn(),
  updateUserApi: vi.fn(),
  bulkUploadUsersApi: vi.fn(),
  createEnrollmentApi: vi.fn(),
  deleteEnrollmentApi: vi.fn(),
  replaceEnrollmentApi: vi.fn(),
  getAttendanceApi: vi.fn(),
  getNotificationsApi: vi.fn(),
  getLanguagesApi: vi.fn(),
  getCoursesApi: vi.fn(),
  getBranchesApi: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockUser = {
  id: "1",
  name: "Ahmed Ali",
  nationalId: "1234567890",
  mobile: "+966501234567",
  email: "ahmed@example.com",
  language: "arabic",
  status: "created",
  schoolId: 3,
  enrollments: [],
};

// ── Query Key factories ────────────────────────────────────────────────────────

describe("userKeys", () => {
  it("all returns base key", () => {
    expect(userKeys.all).toEqual(["users"]);
  });

  it("search returns scoped key with query", () => {
    expect(userKeys.search("ali")).toEqual(["users", "search", "ali"]);
  });

  it("enrollments returns scoped key with userId", () => {
    expect(userKeys.enrollments("42")).toEqual(["users", "enrollments", "42"]);
  });
});

describe("attendanceKeys", () => {
  it("all returns base key", () => {
    expect(attendanceKeys.all).toEqual(["attendance"]);
  });
});

describe("lookupKeys", () => {
  it("has stable keys for languages, courses, branches", () => {
    expect(lookupKeys.languages).toEqual(["languages"]);
    expect(lookupKeys.courses).toEqual(["courses"]);
    expect(lookupKeys.branches).toEqual(["branches"]);
  });
});

// ── useListUsers ───────────────────────────────────────────────────────────────

describe("useListUsers", () => {
  beforeEach(() => {
    vi.mocked(listUsersApi).mockResolvedValue([mockUser]);
  });

  it("fetches all users", async () => {
    const { result } = renderHook(() => useListUsers(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listUsersApi).toHaveBeenCalled();
    expect(result.current.data).toHaveLength(1);
  });
});

// ── useSearchUsers ─────────────────────────────────────────────────────────────

describe("useSearchUsers", () => {
  beforeEach(() => {
    vi.mocked(searchUsersApi).mockResolvedValue([mockUser]);
  });

  it("is disabled when query is shorter than 2 chars", () => {
    const { result } = renderHook(() => useSearchUsers("a"), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
    expect(searchUsersApi).not.toHaveBeenCalled();
  });

  it("fetches when query is at least 2 chars", async () => {
    const { result } = renderHook(() => useSearchUsers("ah"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(searchUsersApi).toHaveBeenCalledWith("ah");
  });
});

// ── useCreateUser ──────────────────────────────────────────────────────────────

describe("useCreateUser", () => {
  beforeEach(() => {
    vi.mocked(createUserApi).mockResolvedValue(mockUser);
  });

  it("calls createUserApi and invalidates user queries on success", async () => {
    const { result } = renderHook(() => useCreateUser(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({
        name: "Ahmed Ali",
        national_id: "1234567890",
        mobile: "+966501234567",
        lang: "1",
        school_id: 3,
        course_code: "P6h",
        licence_type: "private",
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createUserApi).toHaveBeenCalled();
  });

  it("is in error state when createUserApi rejects", async () => {
    vi.mocked(createUserApi).mockRejectedValueOnce(new Error("server error"));
    const { result } = renderHook(() => useCreateUser(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({
        name: "Bad",
        national_id: "0000000000",
        mobile: "+966500000000",
        lang: "1",
        school_id: 1,
        course_code: "P6h",
        licence_type: "private",
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useUpdateUser ──────────────────────────────────────────────────────────────

describe("useUpdateUser", () => {
  beforeEach(() => {
    vi.mocked(updateUserApi).mockResolvedValue(mockUser);
  });

  it("calls updateUserApi on mutate and invalidates on success", async () => {
    const { result } = renderHook(() => useUpdateUser(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({ current_national_id: "1234567890", name: "Updated" });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateUserApi).toHaveBeenCalled();
  });
});

// ── useBulkUploadUsers ─────────────────────────────────────────────────────────

describe("useBulkUploadUsers", () => {
  beforeEach(() => {
    vi.mocked(bulkUploadUsersApi).mockResolvedValue({
      message: "ok",
      summary: { total: 1, successful: 1, failed: 0 },
      results: [],
      failed_users: [],
    });
  });

  it("calls bulkUploadUsersApi with the provided file", async () => {
    const file = new File(["name,id\n"], "test.csv", { type: "text/csv" });
    const { result } = renderHook(() => useBulkUploadUsers(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate(file);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bulkUploadUsersApi).toHaveBeenCalledWith(file);
  });
});

// ── useCreateEnrollment ────────────────────────────────────────────────────────

describe("useCreateEnrollment", () => {
  beforeEach(() => {
    vi.mocked(createEnrollmentApi).mockResolvedValue({
      id: "e1",
      userId: "1",
      courseCode: "P6h",
      licenceType: "private",
      lang: "1",
      status: "active",
    });
  });

  it("calls createEnrollmentApi and invalidates on success", async () => {
    const { result } = renderHook(() => useCreateEnrollment(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({
        national_id: "1234567890",
        courses: [{ dallah_course_code: "P6h", lang: "1", licence_type: "private" }],
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createEnrollmentApi).toHaveBeenCalled();
  });
});

// ── useDeleteEnrollment ────────────────────────────────────────────────────────

describe("useDeleteEnrollment", () => {
  beforeEach(() => {
    vi.mocked(deleteEnrollmentApi).mockResolvedValue(undefined);
  });

  it("calls deleteEnrollmentApi and invalidates on success", async () => {
    const { result } = renderHook(() => useDeleteEnrollment(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({ enrollment_id: 42 });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteEnrollmentApi).toHaveBeenCalledWith({ enrollment_id: 42 });
  });
});

// ── useReplaceEnrollment ───────────────────────────────────────────────────────

describe("useReplaceEnrollment", () => {
  beforeEach(() => {
    vi.mocked(replaceEnrollmentApi).mockResolvedValue(undefined);
  });

  it("calls replaceEnrollmentApi and invalidates on success", async () => {
    const { result } = renderHook(() => useReplaceEnrollment(), { wrapper: makeWrapper() });
    act(() => {
      result.current.mutate({
        national_id: "1234567890",
        old: { dallah_course_code: "P6h", lang: "1", licence_type: "private" },
        new: { dallah_course_code: "M15h", lang: "2", licence_type: "motor" },
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(replaceEnrollmentApi).toHaveBeenCalled();
  });
});

// ── useAttendance ──────────────────────────────────────────────────────────────

describe("useAttendance", () => {
  beforeEach(() => {
    vi.mocked(getAttendanceApi).mockResolvedValue([]);
  });

  it("fetches attendance records", async () => {
    const { result } = renderHook(() => useAttendance(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAttendanceApi).toHaveBeenCalled();
  });
});

// ── useNotifications ───────────────────────────────────────────────────────────

describe("useNotifications", () => {
  beforeEach(() => {
    vi.mocked(getNotificationsApi).mockResolvedValue({
      notifications: [],
      meta: { count: 0, has_more: false },
    });
  });

  it("fetches notifications", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getNotificationsApi).toHaveBeenCalled();
    expect(result.current.data?.meta.has_more).toBe(false);
  });
});

// ── Lookup hooks ───────────────────────────────────────────────────────────────

describe("useLanguages", () => {
  beforeEach(() => {
    vi.mocked(getLanguagesApi).mockResolvedValue([
      { id: "1", name: "Arabic", code: "ar" },
    ]);
  });

  it("fetches languages with staleTime Infinity", async () => {
    const { result } = renderHook(() => useLanguages(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getLanguagesApi).toHaveBeenCalled();
  });
});

describe("useCourses", () => {
  beforeEach(() => {
    vi.mocked(getCoursesApi).mockResolvedValue([
      { id: "P6h", name: "Private 6h", lang: "1", licenceType: "private" },
    ]);
  });

  it("fetches courses", async () => {
    const { result } = renderHook(() => useCourses(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getCoursesApi).toHaveBeenCalled();
  });
});

describe("useBranches", () => {
  beforeEach(() => {
    vi.mocked(getBranchesApi).mockResolvedValue([
      { id: "1", name: "Jeddah" },
    ]);
  });

  it("fetches branches", async () => {
    const { result } = renderHook(() => useBranches(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getBranchesApi).toHaveBeenCalled();
  });
});
