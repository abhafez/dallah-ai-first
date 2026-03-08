"use client";

import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/features/auth/queries";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function DashboardPage() {
  const { user } = useAuth();
  const logout = useLogout();
  const t = useTranslations("Dashboard");

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button
            variant="outline"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? t("signingOut") : t("signOut")}
          </Button>
        </div>
      </div>

      {user && (
        <p className="text-muted-foreground">
          {t("welcomeBack")},{" "}
          <span className="font-medium text-foreground">{user.name}</span>!
        </p>
      )}

      {/* Dashboard content goes here */}
    </div>
  );
}
