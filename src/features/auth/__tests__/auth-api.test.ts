import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { loginApi, getMeApi } from "../api";
import type { AuthUser, LoginResponse } from "../types";

// Must match the URL construction in axios.ts and handlers.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL + "/api/v1/dallah"
  : "http://localhost:31000/api/v1/dallah";

describe("Auth API", () => {

  // ─────────────────────────────────────────────────────────────────────────
  // loginApi
  // ─────────────────────────────────────────────────────────────────────────
  describe("loginApi", () => {
    it("should return token and admin on successful login", async () => {
      const mockAdmin: AuthUser = {
        id: 1,
        name: "K Saleh",
        email: "ksaleh@gmail.com",
        role: "super_admin",
      };

      server.use(
        http.post(`${API_BASE}/auth/login`, async () => {
          return HttpResponse.json({
            token: "eyJhbGci.test.token",
            admin: mockAdmin,
          });
        })
      );

      const result = await loginApi({
        email: "ksaleh@gmail.com",
        password: "Dallah@2026!",
      });

      expect(result.token).toBe("eyJhbGci.test.token");
      expect(result.admin).toEqual(mockAdmin);
      expect(result.admin.role).toBe("super_admin");
      expect(result.admin.id).toBe(1);
    });

    it("should throw on invalid credentials (401)", async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, async () => {
          return HttpResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        })
      );

      await expect(
        loginApi({ email: "bad@test.com", password: "wrong" })
      ).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // getMeApi
  // ─────────────────────────────────────────────────────────────────────────
  describe("getMeApi", () => {
    it("should return the current admin from the { admin } wrapper", async () => {
      const mockAdmin: AuthUser = {
        id: 1,
        name: "K Saleh",
        email: "ksaleh@gmail.com",
        role: "super_admin",
      };

      server.use(
        http.get(`${API_BASE}/auth/me`, async () => {
          return HttpResponse.json({ admin: mockAdmin });
        })
      );

      localStorage.setItem("auth_token", "valid-token");
      const result = await getMeApi();

      expect(result).toEqual(mockAdmin);
      expect(result.role).toBe("super_admin");
      expect(result.id).toBe(1);
    });

    it("should throw on 401 when token is invalid", async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, async () => {
          return HttpResponse.json(
            { error: "authorization required", status: 401 },
            { status: 401 }
          );
        })
      );

      await expect(getMeApi()).rejects.toThrow();
    });
  });
});
