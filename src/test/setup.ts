import React from "react";
import "@testing-library/jest-dom/vitest";
import {afterAll, afterEach, beforeAll, vi} from "vitest";
import {server} from "../mocks/server";

// Mock localStorage for jsdom
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = String(value);
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    };
})();
Object.defineProperty(globalThis, "localStorage", {value: localStorageMock});
Object.defineProperty(window, "localStorage", {value: localStorageMock});

// Mock matchMedia for Radix UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};


beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    localStorageMock.clear();
});
afterAll(() => server.close());

// Global mocks for Next.js built-ins
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: any) => children,
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("next-intl/server", () => ({
  getMessages: vi.fn().mockResolvedValue({}),
}));

vi.mock("next-intl/routing", () => ({
  defineRouting: vi.fn((config) => config),
}));

vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({
    Link: ({ children, href }: any) => React.createElement("a", { href }, children),
    redirect: vi.fn(),
    usePathname: () => "/",
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    getPathname: vi.fn(),
  }),
}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "mocked-inter", className: "mocked-inter" }),
  Geist: () => ({ variable: "mocked-geist-sans", className: "mocked-geist-sans" }),
  Geist_Mono: () => ({ variable: "mocked-geist-mono", className: "mocked-geist-mono" }),
}));
