import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import AddUserPage from "./page";

vi.mock("@/components/users/add-user-form", () => ({
  AddUserForm: () => <div data-testid="add-user-form">Add User Form Mock</div>,
}));

describe("Add User Page", () => {
  it("renders correctly with form", () => {
    render(<AddUserPage />);

    // Translations are mocked to return keys
    expect(screen.getAllByText("title").length).toBeGreaterThan(0);
    expect(screen.getAllByText("description").length).toBeGreaterThan(0);

    expect(screen.getByTestId("add-user-form")).toBeInTheDocument();
  });
});
