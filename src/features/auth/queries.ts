"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi, getMeApi, logoutApi } from "./api";
import type { LoginCredentials, AuthUser } from "./types";

// Query key factory for auth
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// ──────────────────────────────────────────────────────────────────────────────
// useMe — fetch the current authenticated user
// ──────────────────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery<AuthUser>({
    queryKey: authKeys.me(),
    queryFn: getMeApi,
    // Only fetch when a token is present
    enabled:
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("auth_token")),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// useLogin — log in and persist the token
// ──────────────────────────────────────────────────────────────────────────────
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: ({ token, admin }) => {
      // Store in localStorage for the axios interceptor
      localStorage.setItem("auth_token", token);
      // Store in cookie for the Next.js middleware (non-httpOnly, SameSite)
      document.cookie = `auth_token=${token}; path=/; SameSite=Lax`;
      // Pre-populate the 'me' query so no extra fetch is needed
      console.log(admin);
      queryClient.setQueryData<AuthUser>(authKeys.me(), admin);
      router.push("/dashboard");
    },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// useLogout — clear session and redirect
// ──────────────────────────────────────────────────────────────────────────────
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      // Always clear local state even if the API call fails
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0";
      queryClient.clear();
      router.push("/login");
    },
  });
}
