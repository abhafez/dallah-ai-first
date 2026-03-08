import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { getLanguagesApi, getCoursesApi, getBranchesApi } from "../api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL + "/api/v1/dallah"
  : "http://localhost:31000/api/v1/dallah";

describe("Lookup APIs", () => {
  describe("getLanguagesApi", () => {
    it("should return an array of languages unwrapped from { languages }", async () => {
      const result = await getLanguagesApi();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result[0]).toHaveProperty("code");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("locale");

      const arabic = result.find((l) => l.code === "1");
      expect(arabic).toBeDefined();
      expect(arabic!.name).toBe("arabic");
      expect(arabic!.locale).toBe("ar");
    });

    it("should throw on 401", async () => {
      server.use(
        http.get(`${API_BASE}/languages`, () =>
          HttpResponse.json({ error: "authorization required" }, { status: 401 })
        )
      );
      await expect(getLanguagesApi()).rejects.toThrow();
    });
  });

  describe("getCoursesApi", () => {
    it("should return an array of courses unwrapped from { courses }", async () => {
      const result = await getCoursesApi();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("course_name");
      expect(result[0]).toHaveProperty("dallah_course_code");
      expect(result[0]).toHaveProperty("language");
      expect(result[0]).toHaveProperty("category");
    });

    it("should contain courses with language field for filtering", async () => {
      const result = await getCoursesApi();
      const arabicCourses = result.filter((c) => c.language === "arabic");
      expect(arabicCourses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getBranchesApi", () => {
    it("should return an array of branches unwrapped from { branches }", async () => {
      const result = await getBranchesApi();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("branch_id");
      expect(result[0]).toHaveProperty("branch_name");
      expect(result[0]).toHaveProperty("section_id");
      expect(result[0]).toHaveProperty("section_name");
    });
  });
});
