"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useCreateUser,
  useLanguages,
  useCourses,
  useBranches,
} from "@/features/users/queries";
import { SCHOOL_OPTIONS } from "@/features/users/constants";
import {
  addUserSchema,
  type AddUserFormValues,
} from "@/features/users/schemas";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { AxiosError } from "axios";

export function AddUserForm() {
  const t = useTranslations("AddUser");
  const locale = useLocale();
  const createUser = useCreateUser();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch lookup data from API
  const { data: languages, isLoading: languagesLoading } = useLanguages();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: branches, isLoading: branchesLoading } = useBranches();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema) as any,
    defaultValues: {
      name: "",
      mobile: "",
      national_id: "",
      school_id: undefined,
      lang: "1",
      course_code: "",
    } as any,
  });

  const selectedLang = form.watch("lang");

  // Map language code to the language name used in courses API
  const selectedLanguageName = useMemo(() => {
    if (!languages || !selectedLang) return undefined;
    return languages.find((l) => l.code === selectedLang)?.name;
  }, [languages, selectedLang]);

  // Filter courses by the selected language
  const filteredCourses = useMemo(() => {
    if (!courses || !selectedLanguageName) return [];
    return courses.filter((c) => c.language === selectedLanguageName);
  }, [courses, selectedLanguageName]);

  function handleLanguageChange(langCode: string) {
    form.setValue("lang", langCode);
    // Clear course selection when language changes
    form.setValue("course_code", "");
  }

  function onSubmit(values: AddUserFormValues) {
    setSuccessMessage(null);

    // Find the selected course to derive licence_type from its category
    const selectedCourse = courses?.find(
      (c) => c.dallah_course_code === values.course_code
    );

    const payload = {
      name: values.name,
      mobile: values.mobile,
      national_id: values.national_id,
      school_id: values.school_id,
      lang: values.lang,
      courses: [
        {
          dallah_course_code: values.course_code,
          licence_type: selectedCourse?.category || "private" as const,
          lang: values.lang,
        },
      ],
    };

    createUser.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage(t("successMessage"));
        form.reset();
      },
    });
  }

  function getErrorMessage(): string | null {
    if (!createUser.isError) return null;
    const error = createUser.error;
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 409) return t("errorDuplicate");
      if (status === 422) return t("errorMapping");
    }
    return t("errorGeneral");
  }

  const errorMessage = getErrorMessage();
  const lookupsLoading = languagesLoading || coursesLoading || branchesLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Success alert */}
        {successMessage && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mobile — react-phone-number-input with KSA validation */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mobileLabel")}</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("mobilePlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* National ID */}
        <FormField
          control={form.control}
          name="national_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nationalIdLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("nationalIdPlaceholder")}
                  dir="ltr"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch (school) */}
        <FormField
          control={form.control}
          name="school_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("schoolLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
                disabled={branchesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("schoolPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHOOL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {locale === "ar" ? opt.labelAr : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Language — default Arabic ("1"), from API */}
        <FormField
          control={form.control}
          name="lang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("languageLabel")}</FormLabel>
              <Select
                value={field.value}
                onValueChange={handleLanguageChange}
                disabled={languagesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("languagePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages?.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course — filtered by selected language, clears on language change */}
        <FormField
          control={form.control}
          name="course_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("courseLabel")}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedLang || coursesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("coursePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem
                      key={course.dallah_course_code}
                      value={course.dallah_course_code}
                    >
                      {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createUser.isPending || lookupsLoading}
        >
          {createUser.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submitButton")
          )}
        </Button>
      </form>
    </Form>
  );
}
