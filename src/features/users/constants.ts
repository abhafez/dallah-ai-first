// ──────────────────────────────────────────────────────────────────────────────
// Static dropdown options for Language, Level, and Vehicle
// These are used in Add User, Bulk Import, and Enrollment forms.
// If these eventually come from the API, replace with a query hook.
// ──────────────────────────────────────────────────────────────────────────────

import type { Language, Level, Vehicle } from "./types";

export interface DropdownOption<T extends string> {
  value: T;
  labelEn: string;
  labelAr: string;
}

export const LANGUAGE_OPTIONS: DropdownOption<Language>[] = [
  { value: "ar", labelEn: "Arabic", labelAr: "العربية" },
  { value: "en", labelEn: "English", labelAr: "الإنجليزية" },
];

export const LEVEL_OPTIONS: DropdownOption<Level>[] = [
  { value: "beginner", labelEn: "Beginner", labelAr: "مبتدئ" },
  { value: "intermediate", labelEn: "Intermediate", labelAr: "متوسط" },
  { value: "advanced", labelEn: "Advanced", labelAr: "متقدم" },
];

export const VEHICLE_OPTIONS: DropdownOption<Vehicle>[] = [
  { value: "sedan", labelEn: "Sedan", labelAr: "سيدان" },
  { value: "suv", labelEn: "SUV", labelAr: "دفع رباعي" },
  { value: "truck", labelEn: "Truck", labelAr: "شاحنة" },
  { value: "bus", labelEn: "Bus", labelAr: "حافلة" },
  { value: "motorcycle", labelEn: "Motorcycle", labelAr: "دراجة نارية" },
];
