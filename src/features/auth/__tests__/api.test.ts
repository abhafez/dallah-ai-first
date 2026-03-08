import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { loginApi, getMeApi, logoutApi } from "@/features/auth/api";
import type { LoginCredentials } from "@/features/auth/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL + "/api/v1/dallah"
  : "http://localhost:31000/api/v1/dallah";

const mockCredentials: LoginCredentials = {
  email: "user@example.com",
  password: "password123",
};

describe("Auth API with MSW", () => {
  describe("loginApi", () => {
    it("should POST to /auth/login with credentials and return the response", async () => {
      const result = await loginApi(mockCredentials);

      expect(result.token).toBe("d878cc925faf27582697aa88972f7f8c897c7d71f532dfbd0b941915d6e1e391");
      expect(result.admin.email).toBe("ksaleh@gmail.com");
      expect(result.admin.name).toBe("K Saleh");
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
      expect(result.email).toBe("ksaleh@gmail.com");
      expect(result.name).toBe("K Saleh");
    });

    it("should throw on 401 when the token is invalid (not logged in)", async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => {
          return HttpResponse.json(
            { error: "authorization required", status: 401 },
            { status: 401 }
          );
        })
      );
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
