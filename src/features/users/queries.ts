"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserApi,
  searchUsersApi,
  updateUserApi,
  bulkUploadUsersApi,
  getUserEnrollmentsApi,
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

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUserApi(userId, payload),
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

export function useUserEnrollments(userId: string) {
  return useQuery({
    queryKey: userKeys.enrollments(userId),
    queryFn: () => getUserEnrollmentsApi(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => createEnrollmentApi(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.enrollments(variables.userId),
      });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => deleteEnrollmentApi(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useReplaceEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReplaceEnrollmentPayload) => replaceEnrollmentApi(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.enrollments(variables.userId),
      });
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
