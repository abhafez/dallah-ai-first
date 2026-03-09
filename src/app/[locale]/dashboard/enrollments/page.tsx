"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  useListUsers,
  useSearchUsers,
  useUpdateUser,
  useCreateEnrollment,
  useDeleteEnrollment,
  useReplaceEnrollment,
  useBulkUploadUsers,
} from "@/features/users/queries";
import {
  updateUserSchema,
  createEnrollmentSchema,
  type UpdateUserFormValues,
  type CreateEnrollmentFormValues,
} from "@/features/users/schemas";
import {
  LANGUAGE_OPTIONS,
  COURSE_OPTIONS,
  LICENCE_TYPE_OPTIONS,
} from "@/features/users/constants";
import { langNameToCode, downloadBulkCsvTemplateApi } from "@/features/users/api";
import type { User, ApiUserEnrollment, BulkUploadResponse } from "@/features/users/types";
import { AddUserForm } from "@/components/users/add-user-form";
import {
  Search,
  Plus,
  Trash2,
  RefreshCcw,
  CheckCircle,
  Pencil,
  ListChecks,
  RotateCcw,
  UserPlus,
  Upload,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const LOCALE_TO_LANG_CODE: Record<string, string> = {
  ar: "1",
  en: "2",
  ur: "3",
  hi: "4",
};

function resolveLanguageCode(lang: string): string {
  if (LANGUAGE_OPTIONS.some((o) => o.value === lang)) return lang;
  return LOCALE_TO_LANG_CODE[lang] || lang;
}

export default function EnrollmentsPage() {
  const t = useTranslations("Enrollments");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [enrollmentsUser, setEnrollmentsUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUserEnrollment | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<ApiUserEnrollment | null>(null);
  const [showAddEnrollment, setShowAddEnrollment] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkUploadResponse | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkUpload = useBulkUploadUsers();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    setBulkResult(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setFileError("Please select a valid .csv file.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  }

  function handleBulkUpload() {
    if (!selectedFile) {
      setFileError("Please select a CSV file first.");
      return;
    }
    bulkUpload.mutate(selectedFile, {
      onSuccess: (data) => {
        setBulkResult(data);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (data.summary.failed === 0) {
          toast.success(`${data.summary.successful} users uploaded successfully!`);
        } else {
          toast.warning(`${data.summary.successful} uploaded, ${data.summary.failed} failed.`);
        }
        refetch();
      },
      onError: () => toast.error("Upload failed. Please try again."),
    });
  }

  async function handleDownloadTemplate() {
    setIsDownloadingTemplate(true);
    try {
      await downloadBulkCsvTemplateApi();
    } catch {
      toast.error("Failed to download template.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  }

  function downloadErrorReport() {
    if (!bulkResult?.failed_users.length) return;
    const csv =
      "national_id,name,errors\n" +
      bulkResult.failed_users
        .map((u) => `${u.national_id},${u.name || ""},${u.errors.join("; ")}`)
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "error_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const { data: allUsers, isLoading: allLoading, refetch } = useListUsers();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(activeSearch);

  const isSearchActive = activeSearch.length >= 2;
  const displayedUsers = isSearchActive ? searchResults : allUsers;
  const isLoading = isSearchActive ? searchLoading : allLoading;

  const updateUser = useUpdateUser();
  const createEnrollment = useCreateEnrollment();
  const deleteEnrollment = useDeleteEnrollment();
  const replaceEnrollment = useReplaceEnrollment();

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: "", mobile: "", lang: "" },
  });

  const addEnrollmentForm = useForm<CreateEnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: { lang: "", licence_type: undefined as any, dallah_course_code: "" },
  });

  const replaceForm = useForm<CreateEnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: { lang: "", licence_type: undefined as any, dallah_course_code: "" },
  });

  function handleSearch() {
    setActiveSearch(searchQuery);
    setSuccessMsg(null);
  }

  function handleRefresh() {
    setActiveSearch("");
    setSearchQuery("");
    refetch();
    setSuccessMsg(null);
  }

  function openEditDialog(user: User) {
    editForm.reset({
      name: user.name,
      mobile: user.mobile,
      lang: resolveLanguageCode(user.language),
    });
    setEditTarget(user);
    setSuccessMsg(null);
  }

  function openManageEnrollments(user: User) {
    setEnrollmentsUser(user);
    setSuccessMsg(null);
  }

  function handleEditUser(values: UpdateUserFormValues) {
    if (!editTarget) return;
    updateUser.mutate(
      { current_national_id: editTarget.nationalId, ...values },
      {
        onSuccess: () => {
          toast.success(t("editSuccess"));
          setEditTarget(null);
        },
      },
    );
  }

  function handleDeleteEnrollment() {
    if (!deleteTarget || !enrollmentsUser) return;
    deleteEnrollment.mutate(
      {
        national_id: enrollmentsUser.nationalId,
        dallah_course_code: deleteTarget.course.dallah_course_code,
        lang: langNameToCode(deleteTarget.course.language),
        licence_type: deleteTarget.course.category,
      },
      {
        onSuccess: () => {
          setSuccessMsg(t("deleteSuccess"));
          setDeleteTarget(null);
          setEnrollmentsUser((prev) =>
            prev
              ? {
                  ...prev,
                  enrollments: prev.enrollments?.filter((e) => e.id !== deleteTarget.id),
                }
              : null,
          );
        },
      },
    );
  }

  function handleAddEnrollment(values: CreateEnrollmentFormValues) {
    if (!enrollmentsUser) return;
    createEnrollment.mutate(
      {
        national_id: enrollmentsUser.nationalId,
        dallah_course_code: values.dallah_course_code,
        lang: values.lang,
        licence_type: values.licence_type,
      },
      {
        onSuccess: () => {
          setSuccessMsg(t("createSuccess"));
          setShowAddEnrollment(false);
          setEnrollmentsUser(null);
          addEnrollmentForm.reset();
        },
      },
    );
  }

  function handleReplaceEnrollment(values: CreateEnrollmentFormValues) {
    if (!replaceTarget || !enrollmentsUser) return;
    replaceEnrollment.mutate(
      {
        national_id: enrollmentsUser.nationalId,
        old: {
          dallah_course_code: replaceTarget.course.dallah_course_code,
          lang: langNameToCode(replaceTarget.course.language),
          licence_type: replaceTarget.course.category,
        },
        new: {
          dallah_course_code: values.dallah_course_code,
          lang: values.lang,
          licence_type: values.licence_type,
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg(t("replaceSuccess"));
          setReplaceTarget(null);
          setEnrollmentsUser(null);
          replaceForm.reset();
        },
      },
    );
  }

  function getLangLabel(lang: string): string {
    const code = resolveLanguageCode(lang);
    const opt = LANGUAGE_OPTIONS.find((o) => o.value === code);
    return opt ? (locale === "ar" ? opt.labelAr : opt.labelEn) : lang;
  }

  function renderEnrollmentForm(
    form: ReturnType<typeof useForm<CreateEnrollmentFormValues>>,
    onSubmit: (v: CreateEnrollmentFormValues) => void,
    isPending: boolean,
    submitLabel: string,
  ) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit) as any} className="space-y-4">
          <FormField
            control={form.control}
            name="lang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("courseLanguage")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("languagePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {locale === "ar" ? o.labelAr : o.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licence_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("licenceType")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("languagePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LICENCE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {locale === "ar" ? o.labelAr : o.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dallah_course_code"
            render={({ field }) => {
              const selectedType = form.watch("licence_type");
              const filteredCourses = COURSE_OPTIONS.filter(
                (c) => !selectedType || c.type === selectedType,
              );
              return (
                <FormItem>
                  <FormLabel>{t("course")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("languagePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCourses.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {locale === "ar" ? o.labelAr : o.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      {successMsg && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Search + Actions */}
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 flex-1 max-w-lg">
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            dir="ltr"
            className="h-9"
          />
          <Button size="sm" onClick={handleSearch} disabled={isLoading}>
            <Search className="h-3.5 w-3.5 mr-1.5" />
            {isLoading && isSearchActive ? t("searching") : t("searchButton")}
          </Button>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex gap-2 ms-auto">
          <Button size="sm" variant="outline" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Bulk Import
          </Button>
          <Button size="sm" onClick={() => setShowAddUser(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loadingUsers")}</p>
          ) : displayedUsers && displayedUsers.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("nationalId")}</TableHead>
                    <TableHead>{t("mobile")}</TableHead>
                    <TableHead>{t("language")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("enrollmentsCount")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="font-mono text-sm">{user.nationalId}</TableCell>
                      <TableCell className="font-mono text-sm">{user.mobile}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getLangLabel(user.language)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.status || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.enrollments?.length ?? 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            {t("editUser")}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openManageEnrollments(user)}
                          >
                            <ListChecks className="h-3 w-3 mr-1" />
                            {t("manageEnrollments")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noResults")}</p>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUserTitle")}</DialogTitle>
            <DialogDescription>{t("editUserDescription")}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditUser) as any}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nameLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mobileLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="lang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("languageLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("languagePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {locale === "ar" ? o.labelAr : o.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? t("saving") : t("saveChanges")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Enrollments Dialog */}
      <Dialog
        open={!!enrollmentsUser}
        onOpenChange={(open) => !open && setEnrollmentsUser(null)}
      >
        <DialogContent className="max-w-fit min-w-fit">
          <DialogHeader>
            <DialogTitle>
              {enrollmentsUser
                ? t("manageEnrollmentsTitle", { name: enrollmentsUser.name })
                : ""}
            </DialogTitle>
            <DialogDescription>
              {enrollmentsUser?.nationalId} · {enrollmentsUser?.mobile}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {enrollmentsUser?.enrollments && enrollmentsUser.enrollments.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("course")}</TableHead>
                      <TableHead>{t("courseLanguage")}</TableHead>
                      <TableHead>{t("licenceType")}</TableHead>
                      <TableHead>{t("enrollmentStatus")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollmentsUser.enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="text-sm max-w-fit">
                          {enrollment.course.course_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {enrollment.course.language}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {LICENCE_TYPE_OPTIONS.find(
                              (l) => l.value === enrollment.course.category,
                            )?.[locale === "ar" ? "labelAr" : "labelEn"] ||
                              enrollment.course.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{enrollment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                replaceForm.reset();
                                setReplaceTarget(enrollment);
                              }}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              {t("replaceEnrollment")}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(enrollment)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              {t("deleteEnrollment")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noEnrollments")}</p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  addEnrollmentForm.reset();
                  setShowAddEnrollment(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("createEnrollment")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <AddUserForm />
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog
        open={showBulkImport}
        onOpenChange={(open) => {
          setShowBulkImport(open);
          if (!open) { setSelectedFile(null); setBulkResult(null); setFileError(null); }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Users</DialogTitle>
            <DialogDescription>Upload a CSV file to create multiple users at once.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                type="button"
              >
                {isDownloadingTemplate ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                Download Template
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              <Button
                size="sm"
                onClick={handleBulkUpload}
                disabled={!selectedFile || bulkUpload.isPending}
              >
                {bulkUpload.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Uploading…</>
                ) : (
                  <><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</>
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
                <AlertDescription>Upload failed. Please try again.</AlertDescription>
              </Alert>
            )}

            {bulkResult && (
              <div className="space-y-3">
                <div className="flex gap-4 text-sm">
                  <span>Total: <strong>{bulkResult.summary.total}</strong></span>
                  <span className="text-green-600">Success: <strong>{bulkResult.summary.successful}</strong></span>
                  <span className="text-red-600">Failed: <strong>{bulkResult.summary.failed}</strong></span>
                </div>

                {bulkResult.failed_users.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />Failed Users
                    </h4>
                    <div className="rounded-md border max-h-48 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>National ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Errors</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkResult.failed_users.map((u) => (
                            <TableRow key={u.national_id}>
                              <TableCell className="font-mono text-xs">{u.national_id}</TableCell>
                              <TableCell className="text-xs">{u.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{u.errors.join(", ")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2" onClick={downloadErrorReport}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />Download Error Report
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Enrollment Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteEnrollment")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteEnrollment}
              disabled={deleteEnrollment.isPending}
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Enrollment Dialog */}
      <Dialog
        open={showAddEnrollment}
        onOpenChange={(open) => !open && setShowAddEnrollment(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addEnrollmentTitle")}</DialogTitle>
          </DialogHeader>
          {renderEnrollmentForm(
            addEnrollmentForm,
            handleAddEnrollment,
            createEnrollment.isPending,
            t("createEnrollment"),
          )}
        </DialogContent>
      </Dialog>

      {/* Replace Enrollment Dialog */}
      <Dialog open={!!replaceTarget} onOpenChange={(open) => !open && setReplaceTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("replaceEnrollmentTitle")}</DialogTitle>
            {replaceTarget && (
              <DialogDescription>
                {replaceTarget.course.course_name}
              </DialogDescription>
            )}
          </DialogHeader>
          {renderEnrollmentForm(
            replaceForm,
            handleReplaceEnrollment,
            replaceEnrollment.isPending,
            t("replaceEnrollment"),
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
