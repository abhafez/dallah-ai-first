import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {http, HttpResponse} from "msw";
import {server} from "@/mocks/server";
import {axiosInstance} from "@/lib/axios";
import {
    bulkUploadUsersApi,
    downloadBulkCsvTemplateApi,
    getAttendanceApi,
    getNotificationsApi,
    langNameToCode,
    listUsersApi,
    replaceEnrollmentApi,
    updateUserApi,
} from "../api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL + "/api/v1/dallah"
    : "http://localhost:31000/api/v1/dallah";

const mockApiUser = {
    id: 1,
    name: "Ahmed Ali",
    national_id: "1234567890",
    mobile_number: "+966501234567",
    email: "ahmed@example.com",
    lang: "ar",
    status: "created",
    organization_branch_id: 3,
    enrollments: [],
};

// ──────────────────────────────────────────────────────────────────────────────
// langNameToCode
// ──────────────────────────────────────────────────────────────────────────────
describe("langNameToCode", () => {
    it("maps known language names to numeric codes", () => {
        expect(langNameToCode("arabic")).toBe("1");
        expect(langNameToCode("english")).toBe("2");
        expect(langNameToCode("ardu")).toBe("3");
        expect(langNameToCode("hendi")).toBe("4");
    });

    it("returns '1' as fallback for unknown language names", () => {
        expect(langNameToCode("unknown")).toBe("1");
        expect(langNameToCode("")).toBe("1");
        expect(langNameToCode("french")).toBe("1");
    });

    it("is case-insensitive due to toLowerCase()", () => {
        expect(langNameToCode("Arabic")).toBe("1");
        expect(langNameToCode("ENGLISH")).toBe("2");
        expect(langNameToCode("Ardu")).toBe("3");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// listUsersApi
// ──────────────────────────────────────────────────────────────────────────────
describe("listUsersApi", () => {
    it("returns all mapped users from GET /users (no query param)", async () => {
        server.use(
            http.get(`${API_BASE}/users`, () =>
                HttpResponse.json({users: [mockApiUser]})
            )
        );

        const result = await listUsersApi();

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].nationalId).toBe("1234567890");
        expect(result[0].name).toBe("Ahmed Ali");
        expect(result[0].mobile).toBe("+966501234567");
        expect(result[0].id).toBe("1");
    });

    it("returns empty array when no users exist", async () => {
        server.use(
            http.get(`${API_BASE}/users`, () =>
                HttpResponse.json({users: []})
            )
        );

        const result = await listUsersApi();
        expect(result).toEqual([]);
    });

    it("throws on network error", async () => {
        server.use(
            http.get(`${API_BASE}/users`, () =>
                HttpResponse.json({error: "server error"}, {status: 500})
            )
        );

        await expect(listUsersApi()).rejects.toThrow();
    });

    it("falls back to empty string when lang is missing from API response", async () => {
        server.use(
            http.get(`${API_BASE}/users`, () =>
                HttpResponse.json({users: [{...mockApiUser, lang: ""}]})
            )
        );

        const result = await listUsersApi();
        expect(result[0].language).toBe("");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// updateUserApi
// ──────────────────────────────────────────────────────────────────────────────
describe("updateUserApi", () => {
    it("sends PATCH /users and returns a mapped User", async () => {
        const updatedApiUser = {...mockApiUser, name: "Ahmed Updated"};
        server.use(
            http.patch(`${API_BASE}/users`, () =>
                HttpResponse.json(updatedApiUser)
            )
        );

        const result = await updateUserApi({
            current_national_id: "1234567890",
            name: "Ahmed Updated",
        });

        expect(result.name).toBe("Ahmed Updated");
        expect(result.nationalId).toBe("1234567890");
    });

    it("includes all optional fields in the PATCH body", async () => {
        let requestBody: unknown;
        server.use(
            http.patch(`${API_BASE}/users`, async ({request}) => {
                requestBody = await request.json();
                return HttpResponse.json(mockApiUser);
            })
        );

        await updateUserApi({
            current_national_id: "1234567890",
            name: "New Name",
            mobile: "+966509999999",
            lang: "2",
        });

        expect(requestBody).toEqual({
            current_national_id: "1234567890",
            name: "New Name",
            mobile: "+966509999999",
            lang: "2",
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// bulkUploadUsersApi
// ──────────────────────────────────────────────────────────────────────────────
describe("bulkUploadUsersApi", () => {
    it("posts multipart/form-data to /users/bulk_csv and returns BulkUploadResponse", async () => {
        const mockResponse = {
            message: "Processed",
            summary: {total: 2, successful: 2, failed: 0},
            results: [
                {national_id: "1234567890", name: "Ahmed"},
                {national_id: "2345678901", name: "Fatima"},
            ],
            failed_users: [],
        };
        server.use(
            http.post(`${API_BASE}/users/bulk_csv`, () =>
                HttpResponse.json(mockResponse)
            )
        );

        const file = new File(["name,national_id\nAhmed,1234567890"], "users.csv", {
            type: "text/csv",
        });
        const result = await bulkUploadUsersApi(file);

        expect(result.summary.successful).toBe(2);
        expect(result.summary.failed).toBe(0);
        expect(result.results).toHaveLength(2);
        expect(result.failed_users).toHaveLength(0);
    });

    it("returns failed_users when some rows fail", async () => {
        const mockResponse = {
            message: "Processed with errors",
            summary: {total: 1, successful: 0, failed: 1},
            results: [],
            failed_users: [{national_id: "bad", name: "Bad Row", errors: ["Invalid national ID"]}],
        };
        server.use(
            http.post(`${API_BASE}/users/bulk_csv`, () =>
                HttpResponse.json(mockResponse)
            )
        );

        const file = new File(["bad,bad\n"], "bad.csv", {type: "text/csv"});
        const result = await bulkUploadUsersApi(file);

        expect(result.summary.failed).toBe(1);
        expect(result.failed_users[0].errors).toContain("Invalid national ID");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// downloadBulkCsvTemplateApi
// ──────────────────────────────────────────────────────────────────────────────
describe("downloadBulkCsvTemplateApi", () => {
    let createObjectURLOriginal: typeof URL.createObjectURL;
    let revokeObjectURLOriginal: typeof URL.revokeObjectURL;
    let clickSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        createObjectURLOriginal = URL.createObjectURL;
        revokeObjectURLOriginal = URL.revokeObjectURL;
        URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
        URL.revokeObjectURL = vi.fn();
        clickSpy = vi.fn();
        HTMLAnchorElement.prototype.click = clickSpy;
    });

    afterEach(() => {
        URL.createObjectURL = createObjectURLOriginal;
        URL.revokeObjectURL = revokeObjectURLOriginal;
    });

    it("GETs the template, creates an anchor and triggers a download", async () => {
        server.use(
            http.get(`${API_BASE}/users/bulk_csv/template`, () =>
                new HttpResponse("name,national_id\n", {
                    headers: {"Content-Type": "text/csv"},
                })
            )
        );

        await downloadBulkCsvTemplateApi();

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("wraps non-Blob response in a new Blob before creating object URL", async () => {
        // Mock axiosInstance.get to return a raw string (not a Blob) so the
        // `data instanceof Blob ? data : new Blob([data], ...)` false-branch is hit
        const getSpy = vi
            .spyOn(axiosInstance, "get")
            .mockResolvedValueOnce({data: "name,national_id\n"});

        await downloadBulkCsvTemplateApi();

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        getSpy.mockRestore();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// replaceEnrollmentApi
// ──────────────────────────────────────────────────────────────────────────────
describe("replaceEnrollmentApi", () => {
    it("sends POST /enrollments/replace with a courses array containing old+new", async () => {
        let requestBody: unknown;
        server.use(
            http.post(`${API_BASE}/enrollments/replace`, async ({request}) => {
                requestBody = await request.json();
                return HttpResponse.json({ok: true});
            })
        );

        await replaceEnrollmentApi({
            national_id: "1234567890",
            old: {dallah_course_code: "P6h", lang: "1", licence_type: "private"},
            new: {dallah_course_code: "M15h", lang: "2", licence_type: "motor"},
        });

        expect(requestBody).toEqual({
            national_id: "1234567890",
            courses: [
                {
                    old: {dallah_course_code: "P6h", lang: "1", licence_type: "private"},
                    new: {dallah_course_code: "M15h", lang: "2", licence_type: "motor"},
                },
            ],
        });
    });

    it("throws on server error", async () => {
        server.use(
            http.post(`${API_BASE}/enrollments/replace`, () =>
                HttpResponse.json({error: "not found"}, {status: 422})
            )
        );

        await expect(
            replaceEnrollmentApi({
                national_id: "0000000000",
                old: {dallah_course_code: "P6h", lang: "1", licence_type: "private"},
                new: {dallah_course_code: "M15h", lang: "2", licence_type: "motor"},
            })
        ).rejects.toThrow();
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// getAttendanceApi
// ──────────────────────────────────────────────────────────────────────────────
describe("getAttendanceApi", () => {
    it("returns attendance records from GET /attendance", async () => {
        const mockRecords = [
            {
                id: "1",
                userId: "1",
                userName: "Ahmed Ali",
                courseTitle: "Private 6h",
                status: "started",
                startDate: "2026-01-15T10:00:00Z",
                payloadChangedAt: "2026-01-15T10:00:00Z",
            },
        ];
        server.use(
            http.get(`${API_BASE}/attendance`, () =>
                HttpResponse.json(mockRecords)
            )
        );

        const result = await getAttendanceApi();

        expect(result).toEqual(mockRecords);
        expect(result[0].userName).toBe("Ahmed Ali");
        expect(result[0].status).toBe("started");
    });

    it("returns empty array when no attendance records", async () => {
        server.use(
            http.get(`${API_BASE}/attendance`, () =>
                HttpResponse.json([])
            )
        );

        const result = await getAttendanceApi();
        expect(result).toEqual([]);
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// getNotificationsApi
// ──────────────────────────────────────────────────────────────────────────────
describe("getNotificationsApi", () => {
    it("returns notifications and meta from GET /notifications", async () => {
        const mockResponse = {
            notifications: [
                {
                    id: 42,
                    event_type: "enrollment_outcome",
                    created_at: "2026-03-08T10:00:00Z",
                    enrollment: {
                        aanaab_user_id: 123,
                        enrollment_id: 5,
                        workflow_state: "active",
                        total_progress: 0.25,
                    },
                },
            ],
            meta: {count: 1, has_more: false},
        };
        server.use(
            http.get(`${API_BASE}/notifications`, () =>
                HttpResponse.json(mockResponse)
            )
        );

        const result = await getNotificationsApi();

        expect(result.notifications).toHaveLength(1);
        expect(result.notifications[0].id).toBe(42);
        expect(result.notifications[0].event_type).toBe("enrollment_outcome");
        expect(result.notifications[0].enrollment.total_progress).toBe(0.25);
        expect(result.meta.has_more).toBe(false);
        expect(result.meta.count).toBe(1);
    });

    it("handles has_more: true in meta", async () => {
        server.use(
            http.get(`${API_BASE}/notifications`, () =>
                HttpResponse.json({notifications: [], meta: {count: 0, has_more: true}})
            )
        );

        const result = await getNotificationsApi();
        expect(result.meta.has_more).toBe(true);
        expect(result.notifications).toHaveLength(0);
    });
});
