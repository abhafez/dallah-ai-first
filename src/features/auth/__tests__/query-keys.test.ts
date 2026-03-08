import { describe, it, expect } from "vitest";
import { authKeys } from "@/features/auth/queries";

describe("authKeys (query key factory)", () => {
  it("should have a stable base key", () => {
    expect(authKeys.all).toEqual(["auth"]);
  });

  it("should generate the me query key", () => {
    expect(authKeys.me()).toEqual(["auth", "me"]);
  });

  it("me key should be a superset of the base key", () => {
    const [base] = authKeys.me();
    expect(base).toBe(authKeys.all[0]);
  });
});
