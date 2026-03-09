import { describe, it, expect } from "vitest";
import { queryClient } from "../query-client";

describe("queryClient", () => {
  it("is a QueryClient instance", () => {
    expect(queryClient).toBeDefined();
    expect(typeof queryClient.getQueryCache).toBe("function");
  });

  describe("default options", () => {
    it("has correct staleTime configured", () => {
      expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(1000 * 60 * 5);
    });

    it("has refetchOnWindowFocus disabled", () => {
      expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    });

    it("has mutations retry disabled", () => {
      expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
    });
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

    it("handles error with undefined response", () => {
      expect(retryFn(0, { response: undefined })).toBe(true);
    });

    it("handles error with response but no status", () => {
      expect(retryFn(0, { response: {} })).toBe(true);
    });

    it("handles null error", () => {
      expect(retryFn(0, null)).toBe(true);
    });

    it("handles undefined error", () => {
      expect(retryFn(0, undefined)).toBe(true);
    });

    it("retries on 404 status (failureCount < 1)", () => {
      expect(retryFn(0, { response: { status: 404 } })).toBe(true);
    });

    it("does not retry on 404 after first failure", () => {
      expect(retryFn(1, { response: { status: 404 } })).toBe(false);
    });
  });
});
