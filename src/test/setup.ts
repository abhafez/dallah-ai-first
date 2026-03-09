import "@testing-library/jest-dom/vitest";
import {afterAll, afterEach, beforeAll} from "vitest";
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

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    localStorageMock.clear();
});
afterAll(() => server.close());

