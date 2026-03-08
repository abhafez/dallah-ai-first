import { axiosInstance } from "@/lib/axios";
import type { LoginCredentials, LoginResponse, AuthUser } from "./types";

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
  return data;
}

export async function getMeApi(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<{ admin: AuthUser }>("/auth/me");
  return data.admin;
}

export async function logoutApi(): Promise<void> {
  // No logout endpoint in the API — just resolve so onSettled clears local state
}
