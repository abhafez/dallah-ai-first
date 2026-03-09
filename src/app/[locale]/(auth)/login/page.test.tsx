import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import LoginPage from "./page";

// Mock the LoginForm so we don't need to mount the entire React Hook Form setup here
vi.mock("@/components/auth/login-form", () => ({
  LoginForm: () => <div data-testid="login-form">Login Form Mock</div>,
}));

describe("Login Page", () => {
  it("renders the login page correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("loginTitle")).toBeInTheDocument();
    expect(screen.getByText("loginDescription")).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
