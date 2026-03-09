import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@/test/test-utils";
import BulkImportPage from "./page";
import userEvent from "@testing-library/user-event";
import {toast} from "sonner";
import * as api from "@/features/users/api";
import * as queries from "@/features/users/queries";
import { downloadErrorReportForResult } from "./page";

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock("@/features/users/queries", () => ({
    useBulkUploadUsers: vi.fn(),
}));

vi.mock("@/features/users/api", () => ({
    downloadBulkCsvTemplateApi: vi.fn(),
}));

describe("Bulk Import Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);
    });

    it("renders upload interface correctly", () => {
        render(<BulkImportPage/>);

        expect(screen.getAllByText("title").length).toBeGreaterThan(0);
        expect(screen.getAllByText("description").length).toBeGreaterThan(0);

        expect(
            screen.getByRole("button", {name: /downloadTemplate/i}),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", {name: /uploadButton/i}),
        ).toBeInTheDocument();
    });

    it("handles template download", async () => {
        const user = userEvent.setup();
        const downloadSpy = vi
            .spyOn(api, "downloadBulkCsvTemplateApi")
            .mockResolvedValueOnce();

        render(<BulkImportPage/>);
        const downloadBtn = screen.getByRole("button", {
            name: /downloadTemplate/i,
        });

        await user.click(downloadBtn);
        expect(downloadSpy).toHaveBeenCalled();
    });

    it("handles file selection and validation", async () => {
        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();

        const validFile = new File(["dummy,csv"], "test.csv", {type: "text/csv"});
        fireEvent.change(fileInput, {target: {files: [validFile]}});
        const errorText = screen.queryByText("invalidFormat");
        expect(errorText).toBeNull();
    });

    it("handles file selection with invalid file type", async () => {
        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const invalidFile = new File(["test"], "test.txt", {type: "text/plain"});
        fireEvent.change(fileInput, {target: {files: [invalidFile]}});

        expect(screen.getByText("invalidFormat")).toBeInTheDocument();
    });

    it("handles upload without file selected", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn();

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        expect(screen.getByText("noFile")).toBeInTheDocument();
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("displays error state when upload fails", () => {
        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
            isError: true,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);
        expect(screen.getByText("errorGeneral")).toBeInTheDocument();
    });

    it("displays loading state during upload", () => {
        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: vi.fn(),
            isPending: true,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);
        expect(screen.getByText("uploading")).toBeInTheDocument();
    });

    it("keeps upload button enabled when no file is selected", () => {
        render(<BulkImportPage/>);
        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        expect(uploadBtn).not.toBeDisabled();
    });

    it("disables upload button during upload", async () => {
        const user = userEvent.setup();
        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: vi.fn(),
            isPending: true,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploading/i});
        expect(uploadBtn).toBeDisabled();
    });

    it("handles download template error", async () => {
        const user = userEvent.setup();
        vi.spyOn(api, "downloadBulkCsvTemplateApi").mockRejectedValueOnce(
            new Error("Network error"),
        );

        render(<BulkImportPage/>);
        const downloadBtn = screen.getByRole("button", {
            name: /downloadTemplate/i,
        });

        await user.click(downloadBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("templateError");
        });
    });

    it("displays loading state during template download", async () => {
        const user = userEvent.setup();
        let resolveDownload: () => void;
        const downloadPromise = new Promise<void>((resolve) => {
            resolveDownload = resolve;
        });

        vi.spyOn(api, "downloadBulkCsvTemplateApi").mockReturnValue(downloadPromise);

        render(<BulkImportPage/>);
        const downloadBtn = screen.getByRole("button", {
            name: /downloadTemplate/i,
        });

        await user.click(downloadBtn);

        expect(screen.getByRole("button", {name: /downloadTemplate/i})).toBeDisabled();

        resolveDownload!();
        await waitFor(() => {
            expect(screen.getByRole("button", {name: /downloadTemplate/i})).not.toBeDisabled();
        });
    });
});

describe("Bulk Import Processing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls bulk upload API and displays success toast", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 2, failed: 0, total: 2},
                results: [{national_id: "123"}, {national_id: "456"}],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["dummy,csv"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        expect(mockMutate).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
    });

    it("displays partial success toast when some uploads fail", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 3, failed: 2, total: 5},
                results: [{national_id: "123"}],
                failed_users: [
                    {national_id: "456", name: "Failed User", errors: ["Invalid data"]},
                    {national_id: "789", name: "Another Failed", errors: ["Duplicate"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        expect(toast.warning).toHaveBeenCalled();
    });

    it("displays error toast on upload failure", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onError();
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        expect(toast.error).toHaveBeenCalledWith("errorToast");
    });

    it("clears file input after successful upload", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 1, failed: 0, total: 1},
                results: [{national_id: "123"}],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(fileInput.value).toBe("");
        });
    });
});

describe("Bulk Import Results Display", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("displays successful users in results table", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 2, failed: 0, total: 2},
                results: [
                    {national_id: "123"},
                    {national_id: "456"},
                ],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("resultsTitle")).toBeInTheDocument();
            expect(screen.getByText("123")).toBeInTheDocument();
            expect(screen.getByText("456")).toBeInTheDocument();
        });
    });

    it("displays failed users in results table", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 0, failed: 2, total: 2},
                results: [],
                failed_users: [
                    {national_id: "123", name: "User 1", errors: ["Error 1", "Error 2"]},
                    {national_id: "456", name: "User 2", errors: ["Error 3"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("failedUsers")).toBeInTheDocument();
            expect(screen.getByText("Error 1, Error 2")).toBeInTheDocument();
            expect(screen.getByText("Error 3")).toBeInTheDocument();
        });
    });

    it("downloads error report for failed users", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 1, failed: 2, total: 3},
                results: [],
                failed_users: [
                    {national_id: "123", name: "User 1", errors: ["Error 1"]},
                    {national_id: "456", name: null, errors: ["Error 2"]},
                ],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("downloadErrors")).toBeInTheDocument();
        });

        const downloadBtn = screen.getByRole("button", {name: /downloadErrors/i});
        expect(downloadBtn).toBeInTheDocument();
    });

    it("executes downloadErrorReport with DOM manipulation and URL creation", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
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
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
        const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {
        });

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("downloadErrors")).toBeInTheDocument();
        });

        const downloadBtn = screen.getByRole("button", {name: /downloadErrors/i});
        await user.click(downloadBtn);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it("does not show download error button when no failed users", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 2, failed: 0, total: 2},
                results: [{national_id: "123"}],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("resultsTitle")).toBeInTheDocument();
        });

        expect(screen.queryByText("downloadErrors")).not.toBeInTheDocument();
    });

    it("displays summary statistics correctly", async () => {
        const user = userEvent.setup();
        const mockMutate = vi.fn((file, options) => {
            options.onSuccess({
                summary: {successful: 7, failed: 3, total: 10},
                results: [],
                failed_users: [],
            });
        });

        vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

        render(<BulkImportPage/>);

        const fileInput = document.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
        await user.upload(fileInput, validFile);

        const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
        await user.click(uploadBtn);

        await waitFor(() => {
            expect(screen.getByText("10")).toBeInTheDocument();
            expect(screen.getByText("7")).toBeInTheDocument();
            expect(screen.getByText("3")).toBeInTheDocument();
});
});

it("displays failed users in results table", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
        options.onSuccess({
            summary: {successful: 0, failed: 2, total: 2},
            results: [],
            failed_users: [
                {national_id: "123", name: "User 1", errors: ["Error 1", "Error 2"]},
                {national_id: "456", name: "User 2", errors: ["Error 3"]},
            ],
        });
    });

    vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    render(<BulkImportPage/>);

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
    await user.upload(fileInput, validFile);

    const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
    await user.click(uploadBtn);

    await waitFor(() => {
        expect(screen.getByText("failedUsers")).toBeInTheDocument();
        expect(screen.getByText("Error 1, Error 2")).toBeInTheDocument();
        expect(screen.getByText("Error 3")).toBeInTheDocument();
    });
});

it("downloads error report for failed users", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
        options.onSuccess({
            summary: {successful: 1, failed: 2, total: 3},
            results: [],
            failed_users: [
                {national_id: "123", name: "User 1", errors: ["Error 1"]},
                {national_id: "456", name: null, errors: ["Error 2"]},
            ],
        });
    });

    vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    render(<BulkImportPage/>);

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
    await user.upload(fileInput, validFile);

    const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
    await user.click(uploadBtn);

    await waitFor(() => {
        expect(screen.getByText("downloadErrors")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByRole("button", {name: /downloadErrors/i});
    expect(downloadBtn).toBeInTheDocument();
});

it("executes downloadErrorReport with DOM manipulation and URL creation", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
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
        mutate: mockMutate,
        isPending: false,
        isError: false,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    render(<BulkImportPage />);

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
    await user.upload(fileInput, validFile);

    const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
    await user.click(uploadBtn);

    await waitFor(() => {
        expect(screen.getByText("downloadErrors")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByRole("button", {name: /downloadErrors/i});
    await user.click(downloadBtn);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
});

it("does not show download error button when no failed users", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
        options.onSuccess({
            summary: {successful: 2, failed: 0, total: 2},
            results: [{national_id: "123"}],
            failed_users: [],
        });
    });

    vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    render(<BulkImportPage />);

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
    await user.upload(fileInput, validFile);

    const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
    await user.click(uploadBtn);

    await waitFor(() => {
        expect(screen.queryByText("downloadErrors")).not.toBeInTheDocument();
    });
});

it("displays summary statistics correctly", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
        options.onSuccess({
            summary: {successful: 7, failed: 3, total: 10},
            results: [],
            failed_users: [],
        });
    });

    vi.mocked(queries.useBulkUploadUsers).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    render(<BulkImportPage />);

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["test,data"], "test.csv", {type: "text/csv"});
    await user.upload(fileInput, validFile);

    const uploadBtn = screen.getByRole("button", {name: /uploadButton/i});
    await user.click(uploadBtn);

    await waitFor(() => {
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});
});

describe("downloadErrorReport function", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns early when result is null", () => {
        const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
        const createElementSpy = vi.spyOn(document, "createElement");

        downloadErrorReportForResult(null);

        expect(createObjectURLSpy).not.toHaveBeenCalled();
        expect(createElementSpy).not.toHaveBeenCalled();
    });

    it("returns early when failed_users array is empty", () => {
        const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
        const createElementSpy = vi.spyOn(document, "createElement");

        downloadErrorReportForResult({
            summary: {total: 0, successful: 0, failed: 0},
            results: [],
            failed_users: [],
        });

        expect(createObjectURLSpy).not.toHaveBeenCalled();
        expect(createElementSpy).not.toHaveBeenCalled();
    });

    it("creates CSV with correct format including null names", () => {
        const result = {
            failed_users: [
                {national_id: "123", name: "User 1", errors: ["Error 1", "Error 2"]},
                {national_id: "456", name: null, errors: ["Error 3"]},
                {national_id: "789", name: "User 3", errors: ["Error 4"]},
            ],
        };

        const csvContent =
            "national_id,name,errors\n" +
            result.failed_users
                .map((u) => `${u.national_id},${u.name || ""},${u.errors.join("; ")}`)
                .join("\n");

        expect(csvContent).toContain("123,User 1,Error 1; Error 2");
        expect(csvContent).toContain("456,,Error 3");
        expect(csvContent).toContain("789,User 3,Error 4");
    });

    it("creates blob with correct type", () => {
        const csvContent = "national_id,name,errors\n123,User,Error";
        const blob = new Blob([csvContent], {type: "text/csv"});

        expect(blob.type).toBe("text/csv");
        expect(blob.size).toBeGreaterThan(0);
    });
});
