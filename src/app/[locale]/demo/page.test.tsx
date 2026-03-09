import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import DemoPage from "./page";

describe("Demo Page", () => {
  it("renders typography components correctly", () => {
    render(<DemoPage />);

    expect(screen.getByText("Layout Demo")).toBeInTheDocument();
    expect(screen.getByText("Header Features")).toBeInTheDocument();
    expect(screen.getByText("Footer Features")).toBeInTheDocument();
  });
});
