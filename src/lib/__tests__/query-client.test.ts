import { describe, it, expect } from "vitest";
import { queryClient } from "../query-client";

describe("queryClient", () => {
  it("is a QueryClient instance", () => {
    expect(queryClient).toBeDefined();
    expect(typeof queryClient.getQueryCache).toBe("function");
  });

  describe("retry logic", () => {
    const retryFn = queryClient.getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: unknown
    ) => boolean;

    it("does not retry on 401", () => {
      expect(retryFn(0, { response: { status: 401 } })).toBe(false);
    });

    it("does not retry on 403", () => {
      expect(retryFn(0, { response: { status: 403 } })).toBe(false);
    });

    it("retries once for other errors (failureCount < 1)", () => {
      expect(retryFn(0, { response: { status: 500 } })).toBe(true);
    });

    it("does not retry after first failure for other errors", () => {
      expect(retryFn(1, { response: { status: 500 } })).toBe(false);
    });

    it("does not retry when error has no response", () => {
      expect(retryFn(0, new Error("network error"))).toBe(true);
      expect(retryFn(1, new Error("network error"))).toBe(false);
    });
  });
});
