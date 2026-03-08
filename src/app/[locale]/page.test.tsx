import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "./page";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}));

describe("Home page", () => {
  it("renders the heading", () => {
    render(<Home />);
    expect(
      screen.getByText(/to get started, edit the page\.tsx file/i),
    ).toBeInTheDocument();
  });

  it("renders the deploy link", () => {
    render(<Home />);
    expect(screen.getByText("Deploy Now")).toBeInTheDocument();
  });

  it("renders the documentation link", () => {
    render(<Home />);
    expect(screen.getByText("Documentation")).toBeInTheDocument();
  });
});
