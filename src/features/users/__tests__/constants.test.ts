import { describe, it, expect } from "vitest";
import {
  LANGUAGE_OPTIONS,
  COURSE_OPTIONS,
  SCHOOL_OPTIONS,
  LICENCE_TYPE_OPTIONS,
} from "../constants";

describe("LANGUAGE_OPTIONS", () => {
  it("has 4 entries with value, labelEn, labelAr", () => {
    expect(LANGUAGE_OPTIONS).toHaveLength(4);
    expect(LANGUAGE_OPTIONS[0].value).toBe("1");
    expect(LANGUAGE_OPTIONS[0].labelEn).toBe("Arabic");
    expect(LANGUAGE_OPTIONS[1].value).toBe("2");
    expect(LANGUAGE_OPTIONS[1].labelEn).toBe("English");
  });
});

describe("COURSE_OPTIONS", () => {
  it("has entries for private, motor, and public types", () => {
    const types = [...new Set(COURSE_OPTIONS.map((c) => c.type))];
    expect(types).toContain("private");
    expect(types).toContain("motor");
    expect(types).toContain("public");
  });

  it("has a value and labelEn for every entry", () => {
    for (const opt of COURSE_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.labelEn).toBeTruthy();
    }
  });
});

describe("SCHOOL_OPTIONS", () => {
  it("has at least one school option", () => {
    expect(SCHOOL_OPTIONS.length).toBeGreaterThan(0);
    expect(SCHOOL_OPTIONS[0].value).toBe("1");
    expect(SCHOOL_OPTIONS[0].labelEn).toContain("Jeddah");
  });
});

describe("LICENCE_TYPE_OPTIONS", () => {
  it("has private, motor, and public options", () => {
    const values = LICENCE_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain("private");
    expect(values).toContain("motor");
    expect(values).toContain("public");
  });
});
