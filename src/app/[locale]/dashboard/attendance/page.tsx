"use client";

import { useTranslations } from "next-intl";
import { useAttendance } from "@/features/users/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { RefreshCcw, AlertCircle } from "lucide-react";

export default function AttendancePage() {
  const t = useTranslations("Attendance");
  const {
    data: records,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAttendance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? t("refreshing") : t("refresh")}
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("errorGeneral")}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : records && records.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("userName")}</TableHead>
                    <TableHead>{t("course")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("startDate")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.userName}
                      </TableCell>
                      <TableCell>{record.courseTitle}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "started"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {record.status === "started"
                            ? t("started")
                            : t("notStarted")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.startDate
                          ? new Date(record.startDate).toLocaleDateString()
                          : "—"}
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
