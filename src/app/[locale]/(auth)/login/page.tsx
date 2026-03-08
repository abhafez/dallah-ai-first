import { LoginForm } from "@/components/auth/login-form";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  const t = useTranslations("Auth");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 relative">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-xl border bg-card shadow-sm px-8 py-10">
          {/* Header */}
          <div className="mb-8 space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("loginTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("loginDescription")}
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
