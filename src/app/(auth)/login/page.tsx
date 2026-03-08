import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-xl border bg-card shadow-sm px-8 py-10">
          {/* Header */}
          <div className="mb-8 space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
