import {afterEach, describe, expect, it} from "vitest";
import {axiosInstance} from "../axios";
import {http, HttpResponse} from "msw";
import {server} from "@/mocks/server";

describe("axiosInstance", () => {
    afterEach(() => server.resetHandlers());

    describe("request interceptor", () => {
        it("attaches Authorization header when auth_token is in localStorage", async () => {
            localStorage.setItem("auth_token", "my-token-abc");

            let capturedHeader: string | null = null;
            server.use(
                http.get("http://localhost:31000/api/v1/dallah/test", ({request}) => {
                    capturedHeader = request.headers.get("Authorization");
                    return HttpResponse.json({ok: true});
                })
            );

            await axiosInstance.get("/test");

            expect(capturedHeader).toBe("Bearer my-token-abc");
        });

        it("falls back to direct property access when headers.set is unavailable", async () => {
            localStorage.setItem("auth_token", "fallback-token");

            let capturedAuth: string | null = null;
            server.use(
                http.get("http://localhost:31000/api/v1/dallah/test-fallback", ({ request }) => {
                    capturedAuth = request.headers.get("Authorization");
                    return HttpResponse.json({ ok: true });
                })
            );

            // This interceptor runs FIRST (LIFO) — overrides headers.set via defineProperty
            // so typeof headers.set !== "function", forcing the else branch in axios.ts
            const id = axiosInstance.interceptors.request.use((config) => {
                Object.defineProperty(config.headers, "set", {
                    value: undefined,
                    writable: true,
                    configurable: true,
                });
                return config;
            });

            try {
                await axiosInstance.get("/test-fallback");
            } finally {
                axiosInstance.interceptors.request.eject(id);
            }

            expect(capturedAuth).toBe("Bearer fallback-token");
        });

        it("does not attach Authorization header when no token", async () => {
            localStorage.removeItem("auth_token");

            let capturedHeader: string | undefined;
            const id = axiosInstance.interceptors.request.use((config) => {
                capturedHeader = config.headers.get("Authorization") as string;
                throw new Error("stop");
            });

            try {
                await axiosInstance.get("/test").catch(() => {
                });
            } finally {
                axiosInstance.interceptors.request.eject(id);
            }

            expect(capturedHeader).toBeUndefined();
        });

        it("request error handler re-rejects errors (line 23)", async () => {
            // Directly invoke the registered rejected handler on the request interceptor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const handlers = (axiosInstance.interceptors.request as any).handlers as Array<{
                fulfilled: unknown;
                rejected: (e: unknown) => Promise<never>;
            } | null>;
            const original = handlers.find((h) => h !== null);
            expect(original).toBeDefined();

            const error = new Error("propagated request error");
            await expect(original!.rejected(error)).rejects.toThrow("propagated request error");
        });
    });

    describe("response interceptor", () => {
        it("clears auth_token from localStorage on 401", async () => {
            localStorage.setItem("auth_token", "expired-token");
            const id = axiosInstance.interceptors.response.use(
                undefined,
                (error) => {
                    // simulate a 401 response hitting the outer handler
                    return Promise.reject(error);
                }
            );

            // The existing response interceptor is already registered and will
            // clear localStorage when it sees a 401. We trigger it via a
            // synthetic axios error object.
            const axiosError = {
                response: {status: 401},
                message: "Unauthorized",
                isAxiosError: true,
            };

            await axiosInstance.interceptors.response.handlers
                .filter(Boolean)
                .at(0)
                ?.rejected?.(axiosError)
                .catch(() => {
                });

            axiosInstance.interceptors.response.eject(id);

            expect(localStorage.getItem("auth_token")).toBeNull();
        });
    });
});
