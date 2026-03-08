import { describe, it, expect } from "vitest";
import { addUserSchema, createEnrollmentSchema } from "../schemas";

describe("addUserSchema", () => {
  it("should validate a correct user payload", () => {
    const validData = {
      name: "Test User",
      mobile: "0512345678",
      nationalId: "1234567890",
      language: "ar" as const,
      level: "beginner" as const,
      vehicle: "sedan" as const,
    };
    const result = addUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail for an invalid Saudi mobile number", () => {
    const invalidData = {
      name: "Test User",
      mobile: "0612345678", // Must start with 05
      nationalId: "1234567890",
      language: "ar" as const,
      level: "beginner" as const,
      vehicle: "sedan" as const,
    };
    const result = addUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("mobileInvalid");
    }
  });

  it("should fail for an invalid national ID", () => {
    const invalidData = {
      name: "Test User",
      mobile: "0512345678",
      nationalId: "12345", // Must be 10 digits
      language: "ar" as const,
      level: "beginner" as const,
      vehicle: "sedan" as const,
    };
    const result = addUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("nationalIdInvalid");
    }
  });

  it("should fail when mandatory fields are missing", () => {
    const invalidData = {
      name: "", // nameRequired (min 1)
      mobile: "0512345678",
      nationalId: "1234567890",
      // missing other fields
    };
    const result = addUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("createEnrollmentSchema", () => {
  it("should validate a correct enrollment payload", () => {
    const validData = {
      userId: "u123",
      language: "en" as const,
      level: "intermediate" as const,
      vehicle: "suv" as const,
    };
    const result = createEnrollmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail with invalid level", () => {
    const invalidData = {
      userId: "u123",
      language: "en" as const,
      level: "expert", // not in enum
      vehicle: "suv" as const,
    };
    const result = createEnrollmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
