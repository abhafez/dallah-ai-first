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
  LEVEL_OPTIONS,
  VEHICLE_OPTIONS,
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
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      mobile: "",
      nationalId: "",
      language: undefined,
      level: undefined,
      vehicle: undefined,
    },
  });

  function onSubmit(values: AddUserFormValues) {
    setSuccessMessage(null);
    createUser.mutate(values, {
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
          name="nationalId"
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

        {/* Language */}
        <FormField
          control={form.control}
          name="language"
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

        {/* Level */}
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("levelLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("levelPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
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

        {/* Vehicle */}
        <FormField
          control={form.control}
          name="vehicle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("vehicleLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("vehiclePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VEHICLE_OPTIONS.map((opt) => (
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
