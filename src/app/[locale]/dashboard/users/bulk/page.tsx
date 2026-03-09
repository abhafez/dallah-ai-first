"use client";

import {useState, useRef, ChangeEvent} from "react";
import { useTranslations } from "next-intl";
import { useBulkUploadUsers } from "@/features/users/queries";
import { downloadBulkCsvTemplateApi } from "@/features/users/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BulkUploadResponse } from "@/features/users/types";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function downloadErrorReportForResult(result: BulkUploadResponse | null) {
  if (!result || !result.failed_users.length) return;
  const csvContent =
    "national_id,name,errors\n" +
    result.failed_users
      .map((u) => `${u.national_id},${u.name || ""},${u.errors.join("; ")}`)
      .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "error_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportPage() {
  const t = useTranslations("BulkImport");
  const bulkUpload = useBulkUploadUsers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    setResult(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setFileError(t("invalidFormat"));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  }

  function handleUpload() {
    if (!selectedFile) {
      setFileError(t("noFile"));
      return;
    }
    bulkUpload.mutate(selectedFile, {
      onSuccess: (data) => {
        setResult(data);
        // Clear the file input on success
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Toast notification
        if (data.summary.failed === 0) {
          toast.success(t("successToast", { count: data.summary.successful }));
        } else {
          toast.warning(
            t("partialSuccessToast", {
              successful: data.summary.successful,
              failed: data.summary.failed,
            }),
          );
        }
      },
      onError: () => {
        toast.error(t("errorToast"));
      },
    });
  }

  async function handleDownloadTemplate() {
    setIsDownloadingTemplate(true);
    try {
      await downloadBulkCsvTemplateApi();
    } catch {
      toast.error(t("templateError"));
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  function downloadErrorReport() {
    downloadErrorReportForResult(result);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("uploadLabel")}
          </CardTitle>
          <CardDescription>{t("uploadHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              type="button"
            >
              {isDownloadingTemplate ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t("downloadTemplate")}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={bulkUpload.isPending}
            >
              {bulkUpload.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("uploading")}
                </>
              ) : (
                t("uploadButton")
              )}
            </Button>
          </div>

          {fileError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {bulkUpload.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t("errorGeneral")}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("resultsTitle")}
            </CardTitle>
            <CardDescription>
              <span className="mr-4">
                {t("totalProcessed")}: <strong>{result.summary.total}</strong>
              </span>
              <span className="mr-4 text-green-600">
                {t("successCount")}:{" "}
                <strong>{result.summary.successful}</strong>
              </span>
              <span className="text-red-600">
                {t("failureCount")}: <strong>{result.summary.failed}</strong>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Successful users */}
            {result.results.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  {t("successfulUsers")}
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("nationalId")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.results.map((user) => (
                        <TableRow key={user.national_id}>
                          <TableCell className="font-mono">
                            {user.national_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("success")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Failed users */}
            {result.failed_users.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {t("failedUsers")}
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("nationalId")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("message")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.failed_users.map((user) => (
                        <TableRow key={user.national_id}>
                          <TableCell className="font-mono">
                            {user.national_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {t("error")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.errors.join(", ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {result.failed_users.length > 0 && (
              <Button variant="outline" onClick={downloadErrorReport}>
                <Download className="h-4 w-4 mr-2" />
                {t("downloadErrors")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
