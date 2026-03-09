"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  getLanguagesApi,
  getCoursesApi,
  getBranchesApi,
} from "./api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  CreateEnrollmentPayload,
  DeleteEnrollmentPayload,
  ReplaceEnrollmentPayload,
} from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Query key factory
// ──────────────────────────────────────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  search: (q: string) => [...userKeys.all, "search", q] as const,
  enrollments: (userId: string) => [...userKeys.all, "enrollments", userId] as const,
};

export const attendanceKeys = {
  all: ["attendance"] as const,
};

export const lookupKeys = {
  languages: ["languages"] as const,
  courses: ["courses"] as const,
  branches: ["branches"] as const,
};

// ──────────────────────────────────────────────────────────────────────────────
// User hooks
// ──────────────────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUserApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => searchUsersApi(query),
    enabled: query.length >= 2,
  });
}

export function useListUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: listUsersApi,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUserApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useBulkUploadUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => bulkUploadUsersApi(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Enrollment hooks
// ──────────────────────────────────────────────────────────────────────────────

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => createEnrollmentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeleteEnrollmentPayload) => deleteEnrollmentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useReplaceEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReplaceEnrollmentPayload) => replaceEnrollmentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Attendance hooks
// ──────────────────────────────────────────────────────────────────────────────

export function useAttendance() {
  return useQuery({
    queryKey: attendanceKeys.all,
    queryFn: getAttendanceApi,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Lookup hooks
// ──────────────────────────────────────────────────────────────────────────────

export function useLanguages() {
  return useQuery({
    queryKey: lookupKeys.languages,
    queryFn: getLanguagesApi,
    staleTime: Infinity,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: lookupKeys.courses,
    queryFn: getCoursesApi,
    staleTime: Infinity,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: lookupKeys.branches,
    queryFn: getBranchesApi,
    staleTime: Infinity,
  });
}
