"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserPlus, Upload, RefreshCcw, ClipboardList } from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/users/add",
    titleKey: "addUserTitle",
    descKey: "addUserDesc",
    icon: <UserPlus className="h-8 w-8 text-primary" />,
  },
  {
    href: "/dashboard/users/bulk",
    titleKey: "bulkImportTitle",
    descKey: "bulkImportDesc",
    icon: <Upload className="h-8 w-8 text-primary" />,
  },
  {
    href: "/dashboard/enrollments",
    titleKey: "enrollmentsTitle",
    descKey: "enrollmentsDesc",
    icon: <RefreshCcw className="h-8 w-8 text-primary" />,
  },
  {
    href: "/dashboard/attendance",
    titleKey: "attendanceTitle",
    descKey: "attendanceDesc",
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
  },
];

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
              <CardHeader className="flex flex-col items-center text-center gap-3">
                {action.icon}
                <div>
                  <CardTitle className="text-base">
                    {t(action.titleKey)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {t(action.descKey)}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
