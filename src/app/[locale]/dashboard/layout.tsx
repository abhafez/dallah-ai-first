"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/features/auth/queries";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  Upload,
  RefreshCcw,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "home",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/dashboard/users/add",
    labelKey: "addUser",
    icon: <UserPlus className="h-4 w-4" />,
  },
  {
    href: "/dashboard/users/bulk",
    labelKey: "bulkImport",
    icon: <Upload className="h-4 w-4" />,
  },
  {
    href: "/dashboard/enrollments",
    labelKey: "enrollments",
    icon: <RefreshCcw className="h-4 w-4" />,
  },
  {
    href: "/dashboard/attendance",
    labelKey: "attendance",
    icon: <ClipboardList className="h-4 w-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const logout = useLogout();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Strip locale prefix to compare paths
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathWithoutLocale === "/dashboard";
    }
    return pathWithoutLocale.startsWith(href);
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold tracking-tight">Dalla AI</h2>
        <p className="text-xs text-muted-foreground">{t("adminPanel")}</p>
      </div>
      <Separator className="mb-2" />
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive(item.href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          {item.icon}
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col justify-between">
          {sidebarContent}
          <div className="border-t p-4">
            {user && (
              <p className="mb-2 truncate text-sm font-medium">{user.name}</p>
            )}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                title={t("logout")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-lg font-semibold">Dalla AI</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
