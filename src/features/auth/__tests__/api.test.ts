import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosInstance } from "@/lib/axios";
import { loginApi, getMeApi, logoutApi } from "@/features/auth/api";
import type { LoginCredentials, AuthUser, LoginResponse } from "@/features/auth/types";

// Mock the axios instance
vi.mock("@/lib/axios", () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockAxios = axiosInstance as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

const mockCredentials: LoginCredentials = {
  email: "user@example.com",
  password: "password123",
};

const mockUser: AuthUser = {
  id: "user-1",
  name: "Test User",
  email: "user@example.com",
};

const mockLoginResponse: LoginResponse = {
  token: "jwt-token-abc",
  user: mockUser,
};

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginApi", () => {
    it("should POST to /auth/login with credentials and return the response", async () => {
      mockAxios.post.mockResolvedValueOnce({ data: mockLoginResponse });

      const result = await loginApi(mockCredentials);

      expect(mockAxios.post).toHaveBeenCalledOnce();
      expect(mockAxios.post).toHaveBeenCalledWith("/auth/login", mockCredentials);
      expect(result).toEqual(mockLoginResponse);
    });

    it("should throw when the server returns an error", async () => {
      mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(loginApi(mockCredentials)).rejects.toThrow("Network Error");
    });
  });

  describe("getMeApi", () => {
    it("should GET /auth/me and return the current user", async () => {
      mockAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await getMeApi();

      expect(mockAxios.get).toHaveBeenCalledOnce();
      expect(mockAxios.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockUser);
    });

    it("should throw on 401 when the token is invalid", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      mockAxios.get.mockRejectedValueOnce(error);

      await expect(getMeApi()).rejects.toEqual(error);
    });
  });

  describe("logoutApi", () => {
    it("should POST to /auth/logout", async () => {
      mockAxios.post.mockResolvedValueOnce({ data: undefined });

      await logoutApi();

      expect(mockAxios.post).toHaveBeenCalledOnce();
      expect(mockAxios.post).toHaveBeenCalledWith("/auth/logout");
    });
  });
});
