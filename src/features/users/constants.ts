// ──────────────────────────────────────────────────────────────────────────────
// Static dropdown options for Language, Level, and Vehicle
// These are used in Add User, Bulk Import, and Enrollment forms.
// If these eventually come from the API, replace with a query hook.
// ──────────────────────────────────────────────────────────────────────────────

import type { DropdownOption } from "./types";

export const LANGUAGE_OPTIONS: DropdownOption<string>[] = [
  { value: "1", labelEn: "Arabic", labelAr: "العربية" },
  { value: "2", labelEn: "English", labelAr: "الإنجليزية" },
  { value: "3", labelEn: "Urdu", labelAr: "الأوردو" },
  { value: "4", labelEn: "Hindi", labelAr: "الهندية" },
];

export const COURSE_OPTIONS = [
  { value: "P6h", labelEn: "Private 6 hours", labelAr: "خصوصي 6 ساعات", type: "private" },
  { value: "P15h", labelEn: "Private 15 hours", labelAr: "خصوصي 15 ساعة", type: "private" },
  { value: "P30h", labelEn: "Private 30 hours", labelAr: "خصوصي 30 ساعة", type: "private" },
  { value: "M6h", labelEn: "Motor 6 hours", labelAr: "دراجة 6 ساعات", type: "motor" },
  { value: "M15h", labelEn: "Motor 15 hours", labelAr: "دراجة 15 ساعة", type: "motor" },
  { value: "M30h", labelEn: "Motor 30 hours", labelAr: "دراجة 30 ساعة", type: "motor" },
  { value: "PUB-L", labelEn: "Public with License", labelAr: "عمومي برخصة", type: "public" },
  { value: "PUB-NL", labelEn: "Public without License", labelAr: "عمومي بدون رخصة", type: "public" },
];

export const SCHOOL_OPTIONS = [
  { value: "1", labelEn: "Jeddah School", labelAr: "مدرسة جدة" },
  { value: "2", labelEn: "Taif School", labelAr: "مدرسة الطائف" },
  { value: "3", labelEn: "Specialized School", labelAr: "مدرسة التخصصي" },
  { value: "4", labelEn: "Kharj School", labelAr: "مدرسة الخرج" },
  { value: "5", labelEn: "Sulay School", labelAr: "مدرسة السلي" },
  { value: "6", labelEn: "Majmaah School", labelAr: "مدرسة المجمعة" },
  { value: "7", labelEn: "Jazan School", labelAr: "مدرسة جازان" },
  { value: "8", labelEn: "Shaqra School", labelAr: "مدرسة شقراء" },
  { value: "9", labelEn: "Wadi ad-Dawasir School", labelAr: "مدرسة وادي الدواسر" },
  { value: "10", labelEn: "Dawadmi School", labelAr: "مدرسة الدوادمي" },
];

export const LICENCE_TYPE_OPTIONS = [
  { value: "private", labelEn: "Private", labelAr: "خصوصي" },
  { value: "motor", labelEn: "Motor", labelAr: "دراجة" },
  { value: "public", labelEn: "Public", labelAr: "عمومي" },
];
