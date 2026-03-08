"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateUser } from "@/features/users/queries";
import {
  addUserSchema,
  type AddUserFormValues,
} from "@/features/users/schemas";
import {
  LANGUAGE_OPTIONS,
  COURSE_OPTIONS,
  SCHOOL_OPTIONS,
  LICENCE_TYPE_OPTIONS,
} from "@/features/users/constants";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { AxiosError } from "axios";

export function AddUserForm() {
  const t = useTranslations("AddUser");
  const locale = useLocale();
  const createUser = useCreateUser();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema) as any,
    defaultValues: {
      name: "",
      mobile: "+9665",
      national_id: "",
      school_id: undefined,
      lang: undefined,
      licence_type: undefined,
      course_code: undefined,
    } as any,
  });

  function onSubmit(values: AddUserFormValues) {
    setSuccessMessage(null);

    // Transform flat form values into the nested API payload structure
    const payload = {
      name: values.name,
      mobile: values.mobile,
      national_id: values.national_id,
      school_id: values.school_id,
      lang: values.lang,
      courses: [
        {
          dallah_course_code: values.course_code,
          licence_type: values.licence_type,
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

        {/* Mobile */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mobileLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("mobilePlaceholder")}
                  dir="ltr"
                  {...field}
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

        {/* School */}
        <FormField
          control={form.control}
          name="school_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("schoolLabel")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
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

        {/* Language */}
        <FormField
          control={form.control}
          name="lang"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("languageLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("languagePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
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

        {/* Licence Type */}
        <FormField
          control={form.control}
          name="licence_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("licenceTypeLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("licenceTypePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LICENCE_TYPE_OPTIONS.map((opt) => (
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

        {/* Course Code */}
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
                <FormLabel>{t("courseLabel")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedType}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("coursePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCourses.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {locale === "ar" ? opt.labelAr : opt.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createUser.isPending}
        >
          {createUser.isPending ? t("submitting") : t("submitButton")}
        </Button>
      </form>
    </Form>
  );
}
