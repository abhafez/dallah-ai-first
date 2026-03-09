import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import DashboardLayout from "./layout";

// Mock resize observer and match media are already in setup.ts

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { name: "Test Admin", email: "admin@test.com" },
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock("@/features/auth/queries", () => ({
  useLogout: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <header data-testid="mock-header">Header Mock</header>,
}));

vi.mock("@/components/layout/logo", () => ({
  Logo: () => <div data-testid="mock-logo">Logo Mock</div>,
}));

describe("Dashboard Layout", () => {
  it("renders layout correctly with sidebar and children", () => {
    render(
      <DashboardLayout>
        <div data-testid="dashboard-content">Main Content</div>
      </DashboardLayout>,
    );

    // Verify logo and user name render in the sidebar
    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();
    expect(screen.getByText("Test Admin")).toBeInTheDocument();

    // Verify top bar and main content render
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();

    // Verify navigation links
    expect(screen.getByText("home")).toBeInTheDocument();
    expect(screen.getByText("addUser")).toBeInTheDocument();
    expect(screen.getByText("bulkImport")).toBeInTheDocument();
    expect(screen.getByText("enrollments")).toBeInTheDocument();
    expect(screen.getByText("attendance")).toBeInTheDocument();
  });

  it("toggles the mobile sidebar constraints", async () => {
    // Render
    render(
      <DashboardLayout>
        <div data-testid="dashboard-content">Main Content</div>
      </DashboardLayout>,
    );

    const user = userEvent.setup();

    // In a JSDom environment, elements are rendered, we just need to test the button click logic
    // Find the mobile header button which has lucide-react icon Menu.
    // It's the first button in the mobile header which is rendered in the DOM.
    // Since we can't easily query by SVGs, we'll try to click the button in the header.
    const headerElement = screen.getByText("Dallah").parentElement;
    const menuButton = headerElement?.querySelector("button");

    expect(menuButton).toBeInTheDocument();

    // Click to open sidebar
    if (menuButton) await user.click(menuButton);

    // After opening, the backdrop should be present. We can find it by its classes
    const backdrop = document.querySelector(
      ".fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden",
    );
    expect(backdrop).toBeInTheDocument();

    // Click backdrop to close
    if (backdrop) await user.click(backdrop);

    // After closing, backdrop should disappear
    const closedBackdrop = document.querySelector(
      ".fixed.inset-0.z-40.bg-black\\/50.lg\\:hidden",
    );
    expect(closedBackdrop).toBeNull();
  });
});
