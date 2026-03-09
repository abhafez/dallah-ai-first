import { describe, it, expect } from "vitest";
import { addUserSchema, createEnrollmentSchema, updateUserSchema } from "../schemas";

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
      lang: "1",
      licence_type: "private",
      dallah_course_code: "P6h",
    };
    const result = createEnrollmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail with invalid licence type", () => {
    const invalidData = {
      lang: "1",
      licence_type: "expert", // not in enum
      dallah_course_code: "P6h",
    };
    const result = createEnrollmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail when dallah_course_code is empty", () => {
    const invalidData = {
      lang: "1",
      licence_type: "private",
      dallah_course_code: "",
    };
    const result = createEnrollmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  const validData = {
    name: "Ahmed Ali",
    mobile: "+966501234567",
    lang: "1",
  };

  it("accepts valid update data", () => {
    expect(updateUserSchema.safeParse(validData).success).toBe(true);
  });

  it("requires name to be non-empty", () => {
    const result = updateUserSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("nameRequired");
    }
  });

  it("requires a valid Saudi mobile number", () => {
    const result = updateUserSchema.safeParse({ ...validData, mobile: "+966123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("mobileInvalid");
    }
  });

  it("rejects empty mobile", () => {
    const result = updateUserSchema.safeParse({ ...validData, mobile: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("mobileInvalid");
    }
  });

  it("requires lang to be non-empty", () => {
    const result = updateUserSchema.safeParse({ ...validData, lang: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("languageRequired");
    }
  });

  it("accepts multiple valid Saudi number formats", () => {
    const numbers = ["+966501234567", "+966551234567", "0501234567"];
    for (const mobile of numbers) {
      expect(updateUserSchema.safeParse({ ...validData, mobile }).success).toBe(true);
    }
  });
});
