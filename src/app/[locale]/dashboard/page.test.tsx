import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import DashboardPage from "./page";

describe("Dashboard Page", () => {
  it("renders quick actions cards successfully", () => {
    // We already mock useTranslations to return keys, so we assert on translation keys
    render(<DashboardPage />);

    // Page Title
    expect(screen.getByText("title")).toBeInTheDocument();

    // Quick Action 1: Add User
    expect(screen.getByText("addUserTitle")).toBeInTheDocument();
    expect(screen.getByText("addUserDesc")).toBeInTheDocument();

    // Quick Action 2: Bulk Import
    expect(screen.getByText("bulkImportTitle")).toBeInTheDocument();
    expect(screen.getByText("bulkImportDesc")).toBeInTheDocument();

    // Quick Action 3: Enrollments
    expect(screen.getByText("enrollmentsTitle")).toBeInTheDocument();
    expect(screen.getByText("enrollmentsDesc")).toBeInTheDocument();

    // Quick Action 4: Attendance
    expect(screen.getByText("attendanceTitle")).toBeInTheDocument();
    expect(screen.getByText("attendanceDesc")).toBeInTheDocument();
  });
});
