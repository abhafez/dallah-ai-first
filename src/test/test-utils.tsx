import React, { ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../messages/en.json";
import { ThemeProvider } from "@/providers/theme-provider";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

export function TestProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();

  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => rtlRender(ui, { wrapper: TestProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
