import { describe, it, expect } from "vitest";
import { loginApi, getMeApi, logoutApi } from "@/features/auth/api";
import type { LoginCredentials } from "@/features/auth/types";

const mockCredentials: LoginCredentials = {
  email: "user@example.com",
  password: "password123",
};

describe("Auth API with MSW", () => {
  describe("loginApi", () => {
    it("should POST to /auth/login with credentials and return the response", async () => {
      const result = await loginApi(mockCredentials);

      expect(result.token).toBe("mock-jwt-token-12345");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Mock Developer User");
    });

    it("should throw when the server returns an error (401)", async () => {
      const badCredentials = { email: "wrong@example.com", password: "123" };
      await expect(loginApi(badCredentials)).rejects.toThrow();
    });
  });

  describe("getMeApi", () => {
    it("should GET /auth/me and return the current user", async () => {
      // Because we statefully mocked `_mockIsAuthenticated` in MSW handlers
      // We must login first to flip the switch for MSW to authorize /me
      await loginApi(mockCredentials);

      const result = await getMeApi();
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Mock Developer User");
    });

    it("should throw on 401 when the token is invalid (not logged in)", async () => {
      // First, log out so MSW rejects the request
      await logoutApi();
      
      await expect(getMeApi()).rejects.toThrow();
    });
  });

  describe("logoutApi", () => {
    it("should clear mock session", async () => {
      // Just ensure it resolves successfully
      await expect(logoutApi()).resolves.toBeUndefined();
    });
  });
});
