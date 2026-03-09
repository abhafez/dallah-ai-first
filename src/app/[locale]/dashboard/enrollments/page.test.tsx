import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import EnrollmentsPage from "./page";
import * as queries from "@/features/users/queries";

// Mock the child components
vi.mock("@/components/users/add-user-form", () => ({
  AddUserForm: () => <div data-testid="add-user-form">Add User Form Mock</div>,
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
const mockSearchUsersData = [{ ...mockUser, name: "Search Result" }];

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
    useBulkUploadUsers: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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
    render(<EnrollmentsPage />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  it("triggers search query updates", async () => {
    const user = userEvent.setup();
    render(<EnrollmentsPage />);

    const searchInput = screen.getByRole("textbox"); // The only input initially
    await user.type(searchInput, "Search Query");

    // The query button
    const searchBtn = screen.getByRole("button", { name: /searchButton/i });
    await user.click(searchBtn);

    // The activeSearch state is set, changing displayedUsers to searchResults
    expect(screen.getByText("Search Result")).toBeInTheDocument();
  });

  it("opens edit dialog and submits form", async () => {
    const user = userEvent.setup();
    render(<EnrollmentsPage />);

    // Click edit user button
    const editBtn = screen.getByRole("button", { name: /editUser/i });
    await user.click(editBtn);

    // Verify modal opens
    expect(screen.getByText("editUserTitle")).toBeInTheDocument();

    // Trigger save changes
    // Wait for the form controls to be visible
    const saveBtn = screen.getByRole("button", { name: /saveChanges/i });

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
    render(<EnrollmentsPage />);

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
    const cancelReplace = screen.getAllByRole("button", { name: /cancel/i })[0];
    await user.click(cancelReplace);

    // Test Add Enrollment Modal opens
    const addBtn = screen.getByRole("button", { name: /createEnrollment/i });
    await user.click(addBtn);

    // Cancel add
    const cancelAdd = screen.getAllByRole("button", { name: /cancel/i })[0];
    await user.click(cancelAdd);

    // Test Delete Enrollment
    mockDeleteEnrollment.mockImplementationOnce((v, o) => o.onSuccess());
    const deleteBtn = screen.getByRole("button", { name: /deleteEnrollment/i });
    await user.click(deleteBtn);

    // Click confirm in the internal dialog
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmBtn);

    expect(mockDeleteEnrollment).toHaveBeenCalled();
    // After delete, the enrollment row goes away
    expect(screen.queryByText("Basic Driving")).toBeNull();
  });
});
