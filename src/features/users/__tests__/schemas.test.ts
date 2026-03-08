import { describe, it, expect } from "vitest";
import { addUserSchema, createEnrollmentSchema } from "../schemas";

describe("addUserSchema", () => {
  it("should validate a correct user payload", () => {
    const validData = {
      name: "Test User",
      mobile: "+966512345678",
      national_id: "1234567890",
      lang: "1",
      school_id: 1,
      course_code: "P6",
    };
    const result = addUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail for an invalid Saudi mobile number", () => {
    const invalidData = {
      name: "Test User",
      mobile: "+966123", // Too short for Saudi
      national_id: "1234567890",
      lang: "1",
      school_id: 1,
      course_code: "P6",
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
      mobile: "+966512345678",
      national_id: "3234567890", // Must start with 1 or 2
      lang: "1",
      school_id: 1,
      course_code: "P6",
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
      mobile: "+966512345678",
      national_id: "1234567890",
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
      lang: "1",
      licence_type: "private",
      course_code: "P6h",
    };
    const result = createEnrollmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail with invalid licence type", () => {
    const invalidData = {
      userId: "u123",
      lang: "1",
      licence_type: "expert", // not in enum
      course_code: "P6h",
    };
    const result = createEnrollmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
