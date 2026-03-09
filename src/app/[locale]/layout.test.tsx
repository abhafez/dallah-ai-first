import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import RootLayout from "./layout";

describe("Root Layout", () => {
  it("renders children successfully", async () => {
    const layout = await RootLayout({
      children: <div data-testid="layout-child">Child Content</div>,
      params: Promise.resolve({ locale: "en" }),
    });

    render(layout as React.ReactElement);

    expect(screen.getByTestId("layout-child")).toBeInTheDocument();
  });

  it("sets correct language and direction direction based on locale", async () => {
    const layoutAr = (await RootLayout({
      children: <></>,
      params: Promise.resolve({ locale: "ar" }),
    })) as React.ReactElement;

    expect((layoutAr as any).props.lang).toBe("ar");
    expect((layoutAr as any).props.dir).toBe("rtl");

    const layoutEn = (await RootLayout({
      children: <></>,
      params: Promise.resolve({ locale: "en" }),
    })) as React.ReactElement;

    expect((layoutEn as any).props.lang).toBe("en");
    expect((layoutEn as any).props.dir).toBe("ltr");
  });
});
