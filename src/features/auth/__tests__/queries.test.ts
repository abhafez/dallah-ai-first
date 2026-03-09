import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useLogin, useLogout, useMe } from "../queries";
import { loginApi, getMeApi, logoutApi } from "../api";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../api", () => ({
  loginApi: vi.fn(),
  getMeApi: vi.fn(),
  logoutApi: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockAdmin = {
  id: 1,
  name: "K Saleh",
  email: "ksaleh@gmail.com",
  role: "super_admin" as const,
};

// ── useMe ──────────────────────────────────────────────────────────────────────

describe("useMe", () => {
  beforeEach(() => {
    vi.mocked(getMeApi).mockResolvedValue(mockAdmin);
  });

  it("is disabled when no auth_token in localStorage", () => {
    localStorage.removeItem("auth_token");
    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches the current user when auth_token is present", async () => {
    localStorage.setItem("auth_token", "valid-token");
    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getMeApi).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockAdmin);
  });
});

// ── useLogin ───────────────────────────────────────────────────────────────────

describe("useLogin", () => {
  beforeEach(() => {
    vi.mocked(loginApi).mockResolvedValue({ token: "test-token-123", admin: mockAdmin });
    mockPush.mockClear();
  });

  it("stores token in localStorage on success", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: "ksaleh@gmail.com", password: "pass" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(localStorage.getItem("auth_token")).toBe("test-token-123");
  });

  it("sets auth_token cookie on success", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: "ksaleh@gmail.com", password: "pass" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(document.cookie).toContain("auth_token=test-token-123");
  });

  it("redirects to /dashboard on success", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: "ksaleh@gmail.com", password: "pass" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("is in error state when loginApi rejects", async () => {
    vi.mocked(loginApi).mockRejectedValueOnce(new Error("Invalid credentials"));
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: "bad@test.com", password: "wrong" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ── useLogout ──────────────────────────────────────────────────────────────────

describe("useLogout", () => {
  beforeEach(() => {
    vi.mocked(logoutApi).mockResolvedValue(undefined);
    mockPush.mockClear();
    localStorage.setItem("auth_token", "existing-token");
  });

  it("removes auth_token from localStorage on settled", async () => {
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("clears auth cookie on settled", async () => {
    document.cookie = "auth_token=old-token; path=/";
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(document.cookie).not.toContain("auth_token=old-token");
  });

  it("redirects to /login on settled", async () => {
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("still clears state even when logoutApi rejects", async () => {
    vi.mocked(logoutApi).mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useLogout(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
