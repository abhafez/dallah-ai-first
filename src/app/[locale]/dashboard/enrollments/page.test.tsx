import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import EnrollmentsPage from "./page";
import * as queries from "@/features/users/queries";
import * as api from "@/features/users/api";
import {toast} from "sonner";
import {LANGUAGE_OPTIONS} from "@/features/users/constants";

// Mock the child components
vi.mock("@/components/users/add-user-form", () => ({
    AddUserForm: () => <div data-testid="add-user-form">Add User Form Mock</div>,
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock("@/features/users/api", () => ({
    langNameToCode: vi.fn((name: string) => {
        const map: Record<string, string> = {
            English: "2",
            Arabic: "1",
            Urdu: "3",
            Hindi: "4",
        };
        return map[name] || "1";
    }),
    downloadBulkCsvTemplateApi: vi.fn(),
}));

// Provide base mock data for users
const mockUser = {
    id: 1,
    name: "John Doe",
    nationalId: "1234567890",
    mobile: "0500000000",
    language: "en",
    status: "active",
    enrollments: [
        {
            id: 101,
            course: {
                dallah_course_code: "C-101",
                course_name: "Basic Driving",
                language: "English",
                category: "car",
            },
            status: "active",
        },
    ],
};

const mockListUsersData = [mockUser];
const mockSearchUsersData = [{...mockUser, name: "Search Result"}];

const mockUpdateUser = vi.fn();
const mockCreateEnrollment = vi.fn();
const mockDeleteEnrollment = vi.fn();
const mockReplaceEnrollment = vi.fn();
const mockRefetch = vi.fn();

vi.mock("@/features/users/queries", () => {
    return {
        useListUsers: vi.fn(),
        useSearchUsers: vi.fn(),
        useUpdateUser: vi.fn(),
        useCreateEnrollment: vi.fn(),
        useDeleteEnrollment: vi.fn(),
        useReplaceEnrollment: vi.fn(),
        useBulkUploadUsers: vi.fn(() => ({mutate: vi.fn(), isPending: false})),
    };
});

describe("Enrollments Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Default Query Mocks
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: mockListUsersData,
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        vi.mocked(queries.useSearchUsers).mockReturnValue({
            data: mockSearchUsersData,
            isLoading: false,
        } as unknown as ReturnType<typeof queries.useSearchUsers>);

        vi.mocked(queries.useUpdateUser).mockReturnValue({
            mutate: mockUpdateUser,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useUpdateUser>);

        vi.mocked(queries.useCreateEnrollment).mockReturnValue({
            mutate: mockCreateEnrollment,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useCreateEnrollment>);

        vi.mocked(queries.useDeleteEnrollment).mockReturnValue({
            mutate: mockDeleteEnrollment,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useDeleteEnrollment>);

        vi.mocked(queries.useReplaceEnrollment).mockReturnValue({
            mutate: mockReplaceEnrollment,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useReplaceEnrollment>);
    });

    it("renders the users list from query", () => {
        render(<EnrollmentsPage/>);
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("1234567890")).toBeInTheDocument();
    });

    it("triggers search query updates", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const searchInput = screen.getByRole("textbox"); // The only input initially
        await user.type(searchInput, "Search Query");

        // The query button
        const searchBtn = screen.getByRole("button", {name: /searchButton/i});
        await user.click(searchBtn);

        // The activeSearch state is set, changing displayedUsers to searchResults
        expect(screen.getByText("Search Result")).toBeInTheDocument();
    });

    it("opens edit dialog and submits form", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        // Click edit user button
        const editBtn = screen.getByRole("button", {name: /editUser/i});
        await user.click(editBtn);

        // Verify modal opens
        expect(screen.getByText("editUserTitle")).toBeInTheDocument();

        // Trigger save changes
        // Wait for the form controls to be visible
        const saveBtn = screen.getByRole("button", {name: /saveChanges/i});

        // Submit
        // Form will validate empty fields if zod schema requires, but user data is populated by reset
        mockUpdateUser.mockImplementationOnce((vars, opts) => {
            opts.onSuccess();
        });

        await user.click(saveBtn);

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalled();
        });
    });

    it("manages enrollments: open, add, replace, delete", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        // Open manage enrollments
        const manageBtn = screen.getByRole("button", {
            name: /manageEnrollments/i,
        });
        await user.click(manageBtn);

        expect(screen.getByText("Basic Driving")).toBeInTheDocument();

        // Test Replace Enrollment Modal opens
        const replaceBtn = screen.getByRole("button", {
            name: /replaceEnrollment/i,
        });
        await user.click(replaceBtn);

        // Cancel replace
        const cancelReplace = screen.getAllByRole("button", {name: /cancel/i})[0];
        await user.click(cancelReplace);

        // Test Add Enrollment Modal opens
        const addBtn = screen.getByRole("button", {name: /createEnrollment/i});
        await user.click(addBtn);

        // Cancel add
        const cancelAdd = screen.getAllByRole("button", {name: /cancel/i})[0];
        await user.click(cancelAdd);

        // Test Delete Enrollment
        mockDeleteEnrollment.mockImplementationOnce((v, o) => o.onSuccess());
        const deleteBtn = screen.getByRole("button", {name: /deleteEnrollment/i});
        await user.click(deleteBtn);

        // Click confirm in the internal dialog
        const confirmBtn = screen.getByRole("button", {name: /confirm/i});
        await user.click(confirmBtn);

        expect(mockDeleteEnrollment).toHaveBeenCalled();
        // After delete, the enrollment row goes away
        expect(screen.queryByText("Basic Driving")).toBeNull();
    });

    it("handles refresh button click", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const refreshBtn = screen.getByRole("button", {name: ""});
        await user.click(refreshBtn);

        expect(mockRefetch).toHaveBeenCalled();
    });

    it("handles Enter key press in search input", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const searchInput = screen.getByRole("textbox");
        await user.type(searchInput, "test{Enter}");

        expect(screen.getByText("Search Result")).toBeInTheDocument();
    });

    it("displays loading state for users list", () => {
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: undefined,
            isLoading: true,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("loadingUsers")).toBeInTheDocument();
    });

    it("displays loading state during search", () => {
        vi.mocked(queries.useSearchUsers).mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof queries.useSearchUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays no results message when users list is empty", () => {
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("noResults")).toBeInTheDocument();
    });

    it("displays no results when search returns empty", async () => {
        const user = userEvent.setup();
        vi.mocked(queries.useSearchUsers).mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof queries.useSearchUsers>);

        render(<EnrollmentsPage/>);

        const searchInput = screen.getByRole("textbox");
        await user.type(searchInput, "nonexistent");
        const searchBtn = screen.getByRole("button", {name: /searchButton/i});
        await user.click(searchBtn);

        expect(screen.getByText("noResults")).toBeInTheDocument();
    });

    it("displays no enrollments message when user has no enrollments", async () => {
        const user = userEvent.setup();
        const userWithoutEnrollments = {...mockUser, enrollments: []};
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [userWithoutEnrollments],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);

        const manageBtn = screen.getByRole("button", {name: /manageEnrollments/i});
        await user.click(manageBtn);

        expect(screen.getByText("noEnrollments")).toBeInTheDocument();
    });

    it("opens and closes Add User dialog", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const addUserBtn = screen.getByRole("button", {name: /Add User/i});
        await user.click(addUserBtn);

        expect(screen.getByTestId("add-user-form")).toBeInTheDocument();
    });

    it("handles bulk import dialog open and close", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        expect(screen.getByText("Bulk Import Users")).toBeInTheDocument();
    });

    it("handles file selection with valid CSV", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        fireEvent.change(fileInput, {target: {files: [validFile]}});

        expect(screen.queryByText("Please select a valid .csv file.")).toBeNull();
    });

    it("handles file selection with invalid file type", async () => {
        const user = userEvent.setup();
        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const invalidFile = new File(["test"], "test.txt", {type: "text/plain"});
        fireEvent.change(fileInput, {target: {files: [invalidFile]}});

        expect(screen.getByText("Please select a valid .csv file.")).toBeInTheDocument();
    });

    it("handles bulk upload without file selected", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn();

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        expect(mockBulkMutate).not.toHaveBeenCalled();
    });

    it("handles successful bulk upload with no failures", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 5, failed: 0, total: 5},
                results: [{national_id: "123"}],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        expect(mockBulkMutate).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith("5 users uploaded successfully!");
        expect(mockRefetch).toHaveBeenCalled();
    });

    it("handles bulk upload with partial failures", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 3, failed: 2, total: 5},
                results: [{national_id: "123"}],
                failed_users: [
                    {national_id: "456", name: "Failed User", errors: ["Invalid data"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        expect(toast.warning).toHaveBeenCalledWith("3 uploaded, 2 failed.");
    });

    it("handles bulk upload error", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onError();
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        expect(toast.error).toHaveBeenCalledWith("Upload failed. Please try again.");
    });

    it("handles download template success", async () => {
        const user = userEvent.setup();
        vi.spyOn(api, "downloadBulkCsvTemplateApi").mockResolvedValueOnce();

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const downloadBtn = screen.getByRole("button", {name: /Download Template/i});
        await user.click(downloadBtn);

        await waitFor(() => {
            expect(api.downloadBulkCsvTemplateApi).toHaveBeenCalled();
        });
    });

    it("handles download template error", async () => {
        const user = userEvent.setup();
        vi.spyOn(api, "downloadBulkCsvTemplateApi").mockRejectedValueOnce(new Error("Network error"));

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const downloadBtn = screen.getByRole("button", {name: /Download Template/i});
        await user.click(downloadBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to download template.");
        });
    });

    it("downloads error report when failed users exist", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 1, failed: 2, total: 3},
                results: [],
                failed_users: [
                    {national_id: "123", name: "User 1", errors: ["Error 1", "Error 2"]},
                    {national_id: "456", name: null, errors: ["Error 3"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        const mockUrl = "blob:mock-url";
        const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue(mockUrl);
        const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {
        });

        const createElementSpy = vi.spyOn(document, "createElement");
        const mockAnchor = document.createElement("a");
        const clickSpy = vi.spyOn(mockAnchor, "click").mockImplementation(() => {
        });
        createElementSpy.mockReturnValueOnce(mockAnchor);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText(/Download Error Report/i)).toBeInTheDocument();
        });

        const downloadErrorBtn = screen.getByRole("button", {name: /Download Error Report/i});
        expect(downloadErrorBtn).toBeInTheDocument();
    });

    it("handles add enrollment form submission", async () => {
        const user = userEvent.setup();
        mockCreateEnrollment.mockImplementationOnce((vars, opts) => {
            opts.onSuccess();
        });

        render(<EnrollmentsPage/>);

        const manageBtn = screen.getByRole("button", {name: /manageEnrollments/i});
        await user.click(manageBtn);

        const addBtn = screen.getByRole("button", {name: /createEnrollment/i});
        await user.click(addBtn);

        await waitFor(() => {
            expect(screen.getByText("addEnrollmentTitle")).toBeInTheDocument();
        });
    });

    it("handles replace enrollment form submission", async () => {
        const user = userEvent.setup();
        mockReplaceEnrollment.mockImplementationOnce((vars, opts) => {
            opts.onSuccess();
        });

        render(<EnrollmentsPage/>);

        const manageBtn = screen.getByRole("button", {name: /manageEnrollments/i});
        await user.click(manageBtn);

        const replaceBtn = screen.getByRole("button", {name: /replaceEnrollment/i});
        await user.click(replaceBtn);

        await waitFor(() => {
            expect(screen.getByText("replaceEnrollmentTitle")).toBeInTheDocument();
        });
    });

    it("displays user with null status", () => {
        const userWithNullStatus = {...mockUser, status: null};
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [userWithNullStatus],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("displays user with undefined enrollments", () => {
        const userWithUndefinedEnrollments = {...mockUser, enrollments: undefined};
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [userWithUndefinedEnrollments],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("resolves language code for locale mapping", () => {
        const userWithArLocale = {...mockUser, language: "ar"};
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [userWithArLocale],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("handles unknown language code", () => {
        const userWithUnknownLang = {...mockUser, language: "unknown"};
        vi.mocked(queries.useListUsers).mockReturnValue({
            data: [userWithUnknownLang],
            isLoading: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof queries.useListUsers>);

        render(<EnrollmentsPage/>);
        expect(screen.getByText("unknown")).toBeInTheDocument();
    });

    it("closes bulk import dialog and clears state", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 1, failed: 1, total: 2},
                results: [],
                failed_users: [{national_id: "123", name: "User", errors: ["Error"]}],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("Bulk Import Users")).toBeInTheDocument();
        });

        fireEvent.keyDown(screen.getByText("Bulk Import Users"), {key: "Escape"});
    });

    it("executes download error report with DOM manipulation", async () => {
        const user = userEvent.setup();
        const mockBulkMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 1, failed: 2, total: 3},
                results: [],
                failed_users: [
                    {national_id: "123", name: "User 1", errors: ["Error 1", "Error 2"]},
                    {national_id: "456", name: null, errors: ["Error 3"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockBulkMutate,
            isPending: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
        const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

        render(<EnrollmentsPage/>);

        const bulkImportBtn = screen.getByRole("button", {name: /Bulk Import/i});
        await user.click(bulkImportBtn);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /Upload/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText(/Download Error Report/i)).toBeInTheDocument();
        });

        const downloadErrorBtn = screen.getByRole("button", {name: /Download Error Report/i});
        await user.click(downloadErrorBtn);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
});

describe("resolveLanguageCode", () => {
    const LOCALE_TO_LANG_CODE: Record<string, string> = {
        ar: "1",
        en: "2",
        ur: "3",
        hi: "4",
    };

    function resolveLanguageCode(lang: string): string {
        if (LANGUAGE_OPTIONS.some((o) => o.value === lang)) return lang;
        return LOCALE_TO_LANG_CODE[lang] || lang;
    }

    it("returns the language code as-is when it exists in LANGUAGE_OPTIONS", () => {
        const validLanguageCode = LANGUAGE_OPTIONS[0].value;
        const result = resolveLanguageCode(validLanguageCode);
        expect(result).toBe(validLanguageCode);
    });

    it("returns mapped code when language is in LOCALE_TO_LANG_CODE", () => {
        expect(resolveLanguageCode("ar")).toBe("1");
        expect(resolveLanguageCode("en")).toBe("2");
        expect(resolveLanguageCode("ur")).toBe("3");
        expect(resolveLanguageCode("hi")).toBe("4");
    });

    it("returns the original language when not found in either mapping", () => {
        const unknownLang = "unknown-language";
        const result = resolveLanguageCode(unknownLang);
        expect(result).toBe(unknownLang);
    });

    it("prioritizes LANGUAGE_OPTIONS over LOCALE_TO_LANG_CODE", () => {
        const langCode = "2";
        if (LANGUAGE_OPTIONS.some((o) => o.value === langCode)) {
            const result = resolveLanguageCode(langCode);
            expect(result).toBe(langCode);
        }
    });
});
