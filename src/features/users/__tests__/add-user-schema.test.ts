import { describe, it, expect } from "vitest";
import { addUserSchema } from "../schemas";

describe("addUserSchema", () => {
  const validData = {
    name: "Ahmed Ali",
    mobile: "+966501234567",
    national_id: "1234567890",
    school_id: 3,
    lang: "1",
    course_code: "P6h",
  };

  it("should accept valid data", () => {
    const result = addUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  // ── Phone validation with libphonenumber-js ────────────────────────────

  it("should accept valid Saudi mobile numbers", () => {
    const validNumbers = [
      "+966501234567",
      "+966551234567",
      "+966599999999",
    ];
    for (const mobile of validNumbers) {
      const result = addUserSchema.safeParse({ ...validData, mobile });
      expect(result.success, `Expected ${mobile} to be valid`).toBe(true);
    }
  });

  it("should accept local Saudi format (libphonenumber-js auto-infers country)", () => {
    const result = addUserSchema.safeParse({ ...validData, mobile: "0501234567" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid phone numbers", () => {
    const invalidNumbers = [
      "",
      "+123",              // too short
      "+966123",           // too short for Saudi
      "abc",
    ];
    for (const mobile of invalidNumbers) {
      const result = addUserSchema.safeParse({ ...validData, mobile });
      expect(result.success, `Expected ${mobile} to be invalid`).toBe(false);
    }
  });

  // ── National ID validation ─────────────────────────────────────────────

  it("should accept 10-digit national IDs starting with 1 or 2", () => {
    expect(addUserSchema.safeParse({ ...validData, national_id: "1234567890" }).success).toBe(true);
    expect(addUserSchema.safeParse({ ...validData, national_id: "2098765432" }).success).toBe(true);
  });

  it("should reject invalid national IDs", () => {
    expect(addUserSchema.safeParse({ ...validData, national_id: "3234567890" }).success).toBe(false);
    expect(addUserSchema.safeParse({ ...validData, national_id: "123456789" }).success).toBe(false);
    expect(addUserSchema.safeParse({ ...validData, national_id: "" }).success).toBe(false);
  });

  // ── Required fields ────────────────────────────────────────────────────

  it("should require name", () => {
    const result = addUserSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("should require lang", () => {
    const result = addUserSchema.safeParse({ ...validData, lang: "" });
    expect(result.success).toBe(false);
  });

  it("should require course_code", () => {
    const result = addUserSchema.safeParse({ ...validData, course_code: "" });
    expect(result.success).toBe(false);
  });

  it("should require school_id >= 1", () => {
    const result = addUserSchema.safeParse({ ...validData, school_id: 0 });
    expect(result.success).toBe(false);
  });
});
