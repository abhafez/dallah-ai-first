import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import AttendancePage from "./page";

const mockRefetch = vi.fn();

vi.mock("@/features/users/queries", () => ({
  useNotifications: () => ({
    data: {
      notifications: [
        {
          id: "notif-1",
          event_type: "enrollment_created",
          created_at: "2023-10-01T10:00:00Z",
          enrollment: {
            aanaab_user_id: "user-123",
            enrollment_id: "enr-123",
            workflow_state: "active",
            total_progress: 0.5,
          },
        },
        {
          id: "notif-2",
          event_type: "enrollment_updated",
          created_at: "2023-10-02T10:00:00Z",
          enrollment: {
            aanaab_user_id: "user-456",
            enrollment_id: "enr-456",
            workflow_state: "pending",
            total_progress: 0.1,
          },
        },
      ],
      meta: {
        has_more: false,
      },
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    isFetching: false,
  }),
}));

import userEvent from "@testing-library/user-event";

describe("Attendance Page", () => {
  it("renders notifications correctly", () => {
    // We already mock useTranslations to return keys, so we assert on translation keys
    render(<AttendancePage />);

    // Check title and description
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("colId")).toBeInTheDocument();
    expect(screen.getByText("colEventType")).toBeInTheDocument();
    expect(screen.getByText("colUserId")).toBeInTheDocument();
    expect(screen.getByText("colEnrollmentId")).toBeInTheDocument();
    expect(screen.getByText("colWorkflowState")).toBeInTheDocument();
    expect(screen.getByText("colProgress")).toBeInTheDocument();
    expect(screen.getByText("colStartedAt")).toBeInTheDocument();

    // Check mocked notification data
    expect(screen.getByText("notif-1")).toBeInTheDocument();
    expect(screen.getByText("enrollment created")).toBeInTheDocument();
    expect(screen.getByText("user-123")).toBeInTheDocument();
    expect(screen.getByText("enr-123")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();

    // Check second notification for the outline badge fallback logic
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("calls refetch when refresh button is clicked", async () => {
    const user = userEvent.setup();
    render(<AttendancePage />);

    // Find the refresh button by text since translations are mocked to "refresh"
    const refreshButton = screen.getByText("refresh").closest("button");
    expect(refreshButton).toBeInTheDocument();

    if (refreshButton) {
      await user.click(refreshButton);
    }
    expect(mockRefetch).toHaveBeenCalled();
  });
});
