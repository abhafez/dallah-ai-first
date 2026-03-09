import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import BulkImportPage from "./page";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/features/users/queries", () => ({
  useBulkUploadUsers: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}));

import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import * as api from "@/features/users/api";

describe("Bulk Import Page", () => {
  it("renders upload interface correctly", () => {
    // We already mock useTranslations to return keys
    render(<BulkImportPage />);

    expect(screen.getAllByText("title").length).toBeGreaterThan(0);
    expect(screen.getAllByText("description").length).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", { name: /downloadTemplate/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /uploadButton/i }),
    ).toBeInTheDocument();
  });

  it("handles template download", async () => {
    const user = userEvent.setup();
    const downloadSpy = vi
      .spyOn(api, "downloadBulkCsvTemplateApi")
      .mockResolvedValueOnce();

    render(<BulkImportPage />);
    const downloadBtn = screen.getByRole("button", {
      name: /downloadTemplate/i,
    });

    await user.click(downloadBtn);
    expect(downloadSpy).toHaveBeenCalled();
  });

  it("handles file selection and validation", async () => {
    render(<BulkImportPage />);

    // In JSDom, inputs of type file can be found by role 'textbox' or just queried
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Select valid file
    const validFile = new File(["dummy,csv"], "test.csv", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    // Error should disappear
    const errorText = screen.queryByText("invalidFormat");
    expect(errorText).toBeNull();
  });
});

import * as queries from "@/features/users/queries";

describe("Bulk Import Processing", () => {
  it("calls bulk upload API and displays success toast", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((file, options) => {
      options.onSuccess({
        summary: { successful: 2, failed: 0, total: 2 },
        results: [{ national_id: "123" }, { national_id: "456" }],
        failed_users: [],
      });
    });

    vi.spyOn(queries, "useBulkUploadUsers").mockReturnValue({
      mutate: mockMutate as unknown,
      isPending: false,
      isError: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      variables: undefined,
      status: "idle",
      isSuccess: false,
      isIdle: true,
      isPaused: false,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      context: undefined,
    } as unknown as ReturnType<typeof queries.useBulkUploadUsers>);

    const toastSpy = vi.spyOn(toast, "success");

    render(<BulkImportPage />);

    // Select valid file
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(["dummy,csv"], "test.csv", { type: "text/csv" });
    await user.upload(fileInput, validFile);

    // Click upload
    const uploadBtn = screen.getByRole("button", { name: /uploadButton/i });
    await user.click(uploadBtn);

    expect(mockMutate).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith("successToast");
  });
});
