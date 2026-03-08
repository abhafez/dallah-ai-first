"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  useSearchUsers,
  useUserEnrollments,
  useCreateEnrollment,
  useDeleteEnrollment,
  useReplaceEnrollment,
} from "@/features/users/queries";
import {
  createEnrollmentSchema,
  type CreateEnrollmentFormValues,
} from "@/features/users/schemas";
import {
  LANGUAGE_OPTIONS,
  COURSE_OPTIONS,
  LICENCE_TYPE_OPTIONS,
} from "@/features/users/constants";
import type { User, Enrollment } from "@/features/users/types";
import { Search, Plus, Trash2, RefreshCcw, CheckCircle } from "lucide-react";

export default function EnrollmentsPage() {
  const t = useTranslations("Enrollments");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<Enrollment | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: users, isLoading: searchLoading } =
    useSearchUsers(activeSearch);
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useUserEnrollments(selectedUser?.id || "");
  const createEnrollment = useCreateEnrollment();
  const deleteEnrollment = useDeleteEnrollment();
  const replaceEnrollment = useReplaceEnrollment();

  const createForm = useForm<CreateEnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: {
      userId: "",
      lang: undefined,
      licence_type: undefined,
      course_code: undefined,
    } as any,
  });

  const replaceForm = useForm<CreateEnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentSchema),
    defaultValues: {
      userId: "",
      lang: undefined,
      licence_type: undefined,
      course_code: undefined,
    } as any,
  });

  function handleSearch() {
    setActiveSearch(searchQuery);
    setSelectedUser(null);
    setSuccessMsg(null);
  }

  function handleSelectUser(user: User) {
    setSelectedUser(user);
    setSuccessMsg(null);
  }

  function handleCreateEnrollment(values: CreateEnrollmentFormValues) {
    createEnrollment.mutate(values, {
      onSuccess: () => {
        setSuccessMsg(t("createSuccess"));
        setShowCreateDialog(false);
        createForm.reset();
      },
    });
  }

  function handleDeleteEnrollment() {
    if (!deleteTarget) return;
    deleteEnrollment.mutate(deleteTarget.id, {
      onSuccess: () => {
        setSuccessMsg(t("deleteSuccess"));
        setDeleteTarget(null);
      },
    });
  }

  function handleReplaceEnrollment(values: CreateEnrollmentFormValues) {
    if (!replaceTarget) return;
    replaceEnrollment.mutate(
      { enrollmentId: replaceTarget.id, ...values },
      {
        onSuccess: () => {
          setSuccessMsg(t("replaceSuccess"));
          setReplaceTarget(null);
          replaceForm.reset();
        },
      },
    );
  }

  function openCreateDialog() {
    if (!selectedUser) return;
    createForm.setValue("userId", selectedUser.id);
    setShowCreateDialog(true);
  }

  function openReplaceDialog(enrollment: Enrollment) {
    if (!selectedUser) return;
    replaceForm.setValue("userId", selectedUser.id);
    setReplaceTarget(enrollment);
  }

  function renderEnrollmentFields(
    form: ReturnType<typeof useForm<CreateEnrollmentFormValues>>,
  ) {
    return (
      <>
        <FormField
          control={form.control}
          name="lang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("language")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>{t("vehicle")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("vehiclePlaceholder")} />
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
          name="course_code"
          render={({ field }) => {
            const selectedType = form.watch("licence_type");
            const filteredCourses = COURSE_OPTIONS.filter(
              (c) => !selectedType || c.type === selectedType,
            );

            return (
              <FormItem>
                <FormLabel>{t("level")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedType}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("levelPlaceholder")} />
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
      </>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              dir="ltr"
            />
            <Button onClick={handleSearch} disabled={searchLoading}>
              <Search className="h-4 w-4 mr-2" />
              {searchLoading ? t("searching") : t("searchButton")}
            </Button>
          </div>

          {/* Search results */}
          {users && users.length > 0 && !selectedUser && (
            <div className="mt-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>National ID</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="font-mono">{user.mobile}</TableCell>
                      <TableCell className="font-mono">
                        {user.nationalId}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectUser(user)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {users && users.length === 0 && activeSearch && (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("noResults")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Selected user enrollments */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {t("userEnrollments", { name: selectedUser.name })}
                </CardTitle>
                <CardDescription>
                  {selectedUser.mobile} · {selectedUser.nationalId}
                </CardDescription>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t("createEnrollment")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("course")}</TableHead>
                      <TableHead>{t("language")}</TableHead>
                      <TableHead>{t("level")}</TableHead>
                      <TableHead>{t("vehicle")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{enrollment.courseTitle}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {LANGUAGE_OPTIONS.find(
                              (l) => l.value === enrollment.lang,
                            )?.labelEn || enrollment.lang}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {COURSE_OPTIONS.find(
                            (c) => c.value === enrollment.course_code,
                          )?.labelEn || enrollment.course_code}
                        </TableCell>
                        <TableCell>
                          {LICENCE_TYPE_OPTIONS.find(
                            (t) => t.value === enrollment.licence_type,
                          )?.labelEn || enrollment.licence_type}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReplaceDialog(enrollment)}
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
              <p className="text-sm text-muted-foreground">
                No enrollments found.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
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

      {/* Create enrollment dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createEnrollment")}</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateEnrollment) as any}
              className="space-y-4"
            >
              {renderEnrollmentFields(createForm)}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={createEnrollment.isPending}>
                  {t("createEnrollment")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Replace enrollment dialog */}
      <Dialog
        open={!!replaceTarget}
        onOpenChange={() => setReplaceTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("replaceEnrollment")}</DialogTitle>
          </DialogHeader>
          <Form {...replaceForm}>
            <form
              onSubmit={
                replaceForm.handleSubmit(handleReplaceEnrollment) as any
              }
              className="space-y-4"
            >
              {renderEnrollmentFields(replaceForm)}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </DialogClose>
                <Button type="submit" disabled={replaceEnrollment.isPending}>
                  {t("replaceEnrollment")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
