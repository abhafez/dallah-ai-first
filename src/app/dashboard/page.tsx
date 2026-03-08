"use client";

import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/features/auth/queries";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Signing out…" : "Sign Out"}
        </Button>
      </div>

      {user && (
        <p className="text-muted-foreground">
          Welcome back,{" "}
          <span className="font-medium text-foreground">{user.name}</span>!
        </p>
      )}

      {/* Dashboard content goes here */}
    </div>
  );
}
