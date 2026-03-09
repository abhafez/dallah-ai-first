"use client";

import { useTranslations } from "next-intl";
import { useNotifications } from "@/features/users/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, AlertCircle, Bell, Info } from "lucide-react";

function workflowBadgeVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
  if (state === "completed") return "default";
  if (state === "active") return "secondary";
  return "outline";
}

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const { data, isLoading, isError, refetch, isFetching } = useNotifications();

  const notifications = data?.notifications ?? [];
  const hasMore = data?.meta.has_more ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? t("refreshing") : t("refresh")}
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("errorGeneral")}</AlertDescription>
        </Alert>
      )}

      {hasMore && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{t("hasMore")}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : notifications.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{t("colId")}</TableHead>
                    <TableHead>{t("colEventType")}</TableHead>
                    <TableHead>{t("colUserId")}</TableHead>
                    <TableHead>{t("colEnrollmentId")}</TableHead>
                    <TableHead>{t("colWorkflowState")}</TableHead>
                    <TableHead>{t("colProgress")}</TableHead>
                    <TableHead>{t("colStartedAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {n.id}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium capitalize">
                          {n.event_type.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {n.enrollment.aanaab_user_id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {n.enrollment.enrollment_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={workflowBadgeVariant(n.enrollment.workflow_state)}>
                          {n.enrollment.workflow_state}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.round(n.enrollment.total_progress * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(n.enrollment.total_progress * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noRecords")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
