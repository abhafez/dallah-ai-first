import { http, HttpResponse, delay } from "msw";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types";
import type {
  ApiUser,
  ApiUserEnrollment,
  CreateUserPayload,
  UpdateUserPayload,
  BulkUploadResponse,
  AttendanceRecord,
} from "@/features/users/types";

// Helper to construct the full URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL + "/api/v1/dallah"
  : "http://localhost:31000/api/v1/dallah";
const url = (path: string) => `${baseUrl}${path}`;

// ──────────────────────────────────────────────────────────────────────────────
// Mock internal DB state
// ──────────────────────────────────────────────────────────────────────────────
let _mockIsAuthenticated = false;
let _nextUserId = 4;
let _nextEnrollmentId = 10;

const MOCK_USER: AuthUser = {
  id: 1,
  email: "ksaleh@gmail.com",
  name: "K Saleh",
  role: "super_admin",
};

const MOCK_ENROLLMENTS_MAP: Record<string, ApiUserEnrollment[]> = {
  "1234567890": [
    {
      id: 1,
      status: "created",
      course: {
        id: 1,
        course_name: "دليل تعليم القيادة النظري للمركبات - مستوى متقدم (عربي)",
        dallah_course_code: "P30h",
        language: "arabic",
        category: "private",
      },
    },
  ],
  "2098765432": [
    {
      id: 2,
      status: "created",
      course: {
        id: 2,
        course_name: "Private 15 hours - Arabic",
        dallah_course_code: "P15h",
        language: "arabic",
        category: "private",
      },
    },
  ],
  "1122334455": [
    {
      id: 3,
      status: "created",
      course: {
        id: 6,
        course_name: "Public with License - Arabic",
        dallah_course_code: "PUB-L",
        language: "english",
        category: "public",
      },
    },
  ],
};

const MOCK_USERS: ApiUser[] = [
  {
    id: 1,
    name: "Ahmed Al-Rashid",
    mobile_number: "+966512345678",
    national_id: "1234567890",
    email: "ahmed@example.com",
    lang: "ar",
    status: "created",
    organization_branch_id: 3,
    enrollments: MOCK_ENROLLMENTS_MAP["1234567890"],
  },
  {
    id: 2,
    name: "Sara Mohammad",
    mobile_number: "+966587654321",
    national_id: "2098765432",
    email: "sara@example.com",
    lang: "ar",
    status: "created",
    organization_branch_id: 1,
    enrollments: MOCK_ENROLLMENTS_MAP["2098765432"],
  },
  {
    id: 3,
    name: "John Smith",
    mobile_number: "+966555555555",
    national_id: "1122334455",
    email: "john@example.com",
    lang: "en",
    status: "created",
    organization_branch_id: 3,
    enrollments: MOCK_ENROLLMENTS_MAP["1122334455"],
  },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "a1",
    userId: "u1",
    userName: "Ahmed Al-Rashid",
    courseTitle: "Defensive Driving - Level 1",
    status: "started",
    startDate: "2026-01-20T09:00:00Z",
    payloadChangedAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "a2",
    userId: "u2",
    userName: "Sara Mohammad",
    courseTitle: "Advanced Driving Skills",
    status: "started",
    startDate: "2026-02-15T10:30:00Z",
    payloadChangedAt: "2026-02-15T10:30:00Z",
  },
  {
    id: "a3",
    userId: "u3",
    userName: "John Smith",
    courseTitle: "Commercial Vehicle Training",
    status: "not_started",
    startDate: null,
    payloadChangedAt: "2026-03-01T14:00:00Z",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────────────────────
export const handlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════════

  // LOGIN
  http.post<never, LoginCredentials, LoginResponse | { error: string }>(
    url("/auth/login"),
    async ({ request }) => {
      await delay(800);
      const body = await request.json();
      if (body.email === "wrong@example.com") {
        return HttpResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      _mockIsAuthenticated = true;
      return HttpResponse.json({
        token: "d878cc925faf27582697aa88972f7f8c897c7d71f532dfbd0b941915d6e1e391",
        admin: MOCK_USER,
      });
    }
  ),

  // GET ME
  http.get<never, never, { admin: AuthUser } | { error: string; status: number }>(
    url("/auth/me"),
    async ({ request }) => {
      await delay(400);
      const authHeader = request.headers.get("Authorization");
      if (!_mockIsAuthenticated && !authHeader?.includes("Bearer")) {
        return HttpResponse.json(
          { error: "authorization required", status: 401 },
          { status: 401 }
        );
      }
      return HttpResponse.json({ admin: MOCK_USER });
    }
  ),


  // ═══════════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════════

  // LIST / SEARCH USERS
  http.get(url("/users"), async ({ request }) => {
    await delay(400);
    const searchUrl = new URL(request.url);
    const q = searchUrl.searchParams.get("q")?.toLowerCase() || "";
    const results = q
      ? MOCK_USERS.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.mobile_number.includes(q) ||
            u.national_id.includes(q),
        )
      : MOCK_USERS.slice(0, 50);
    return HttpResponse.json({ users: results });
  }),

  // CREATE USER
  http.post<never, CreateUserPayload, ApiUser | { message: string }>(
    url("/users"),
    async ({ request }) => {
      await delay(600);
      const body = await request.json();

      const duplicate = MOCK_USERS.find(
        (u) => u.national_id === body.national_id || u.mobile_number === body.mobile,
      );
      if (duplicate) {
        return HttpResponse.json(
          { message: "User with this national ID or mobile already exists." },
          { status: 409 },
        );
      }

      const newUser: ApiUser = {
        id: _nextUserId++,
        name: body.name,
        mobile_number: body.mobile,
        national_id: body.national_id,
        email: "",
        lang: body.lang === "1" ? "ar" : "en",
        status: "created",
        organization_branch_id: body.school_id,
        enrollments: body.courses.map((c, i) => ({
          id: _nextEnrollmentId + i,
          status: "created",
          course: {
            id: i + 1,
            course_name: `Course ${c.dallah_course_code}`,
            dallah_course_code: c.dallah_course_code,
            language: "arabic",
            category: c.licence_type,
          },
        })),
      };
      _nextEnrollmentId += body.courses.length;
      MOCK_USERS.push(newUser);

      return HttpResponse.json(newUser, { status: 201 });
    },
  ),

  // UPDATE USER
  http.patch<never, UpdateUserPayload, ApiUser | { message: string }>(
    url("/users"),
    async ({ request }) => {
      await delay(500);
      const body = await request.json();
      const userIndex = MOCK_USERS.findIndex(
        (u) => u.national_id === body.current_national_id,
      );
      if (userIndex === -1) {
        return HttpResponse.json({ message: "User not found." }, { status: 404 });
      }

      if (body.mobile) {
        const duplicate = MOCK_USERS.find(
          (u) => u.national_id !== body.current_national_id && u.mobile_number === body.mobile,
        );
        if (duplicate) {
          return HttpResponse.json(
            { message: "Another user already has this mobile number." },
            { status: 409 },
          );
        }
      }

      const updated = {
        ...MOCK_USERS[userIndex],
        ...(body.name ? { name: body.name } : {}),
        ...(body.mobile ? { mobile_number: body.mobile } : {}),
        ...(body.lang ? { lang: body.lang } : {}),
      };
      MOCK_USERS[userIndex] = updated;
      return HttpResponse.json(updated);
    },
  ),

  // BULK UPLOAD
  http.post(url("/users/bulk_csv"), async () => {
    await delay(1500);
    // Simulate processing a CSV with some successes and failures
    const response: BulkUploadResponse = {
      message: "Bulk upload processed",
      summary: { total: 5, successful: 3, failed: 2 },
      results: [
        { national_id: "1111111111", name: "Ali Hassan", aanaab_user_id: 101 },
        { national_id: "2222222222", name: "Fatima Omar", aanaab_user_id: 102 },
        { national_id: "3333333333", name: "Khalid Saeed", aanaab_user_id: 103 },
      ],
      failed_users: [
        {
          national_id: "1234567890",
          name: "Nora Ali",
          errors: ["Duplicate national ID"],
        },
        {
          national_id: "invalid",
          name: "Bad Data",
          errors: ["Invalid national ID format"],
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ENROLLMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // CREATE ENROLLMENT
  http.post(
    url("/enrollments"),
    async ({ request }) => {
      await delay(600);
      const body = await request.json() as { national_id: string; courses: Array<{ dallah_course_code: string; lang: string; licence_type: "private" | "motor" | "public" }> };

      const userIndex = MOCK_USERS.findIndex((u) => u.national_id === body.national_id);
      if (userIndex === -1) {
        return HttpResponse.json({ message: "User not found." }, { status: 404 });
      }

      const newEnrollments: ApiUserEnrollment[] = body.courses.map((c) => ({
        id: _nextEnrollmentId++,
        status: "created",
        course: {
          id: _nextEnrollmentId,
          course_name: `Course ${c.dallah_course_code}`,
          dallah_course_code: c.dallah_course_code,
          language: "arabic",
          category: c.licence_type,
        },
      }));
      MOCK_USERS[userIndex].enrollments = [
        ...MOCK_USERS[userIndex].enrollments,
        ...newEnrollments,
      ];
      return HttpResponse.json({ message: "Enrollment created" }, { status: 201 });
    },
  ),

  // DELETE ENROLLMENT
  http.delete(
    url("/enrollments"),
    async ({ request }) => {
      await delay(500);
      const body = await request.json() as { national_id: string; courses: Array<{ dallah_course_code: string }> };

      const userIndex = MOCK_USERS.findIndex((u) => u.national_id === body.national_id);
      if (userIndex === -1) {
        return HttpResponse.json({ message: "User not found." }, { status: 404 });
      }

      const codesToRemove = new Set(body.courses.map((c) => c.dallah_course_code));
      MOCK_USERS[userIndex].enrollments = MOCK_USERS[userIndex].enrollments.filter(
        (e) => !codesToRemove.has(e.course.dallah_course_code),
      );
      return HttpResponse.json({ message: "Enrollment deleted" });
    },
  ),

  // REPLACE ENROLLMENT
  http.post(
    url("/enrollments/replace"),
    async ({ request }) => {
      await delay(800);
      const body = await request.json() as { national_id: string; courses: Array<{ old: { dallah_course_code: string }; new: { dallah_course_code: string; lang: string; licence_type: "private" | "motor" | "public" } }> };

      const userIndex = MOCK_USERS.findIndex((u) => u.national_id === body.national_id);
      if (userIndex === -1) {
        return HttpResponse.json({ message: "User not found." }, { status: 404 });
      }

      for (const replacement of body.courses) {
        const enrollments = MOCK_USERS[userIndex].enrollments;
        const idx = enrollments.findIndex(
          (e) => e.course.dallah_course_code === replacement.old.dallah_course_code,
        );
        if (idx !== -1) {
          enrollments[idx] = {
            id: _nextEnrollmentId++,
            status: "created",
            course: {
              id: _nextEnrollmentId,
              course_name: `Course ${replacement.new.dallah_course_code}`,
              dallah_course_code: replacement.new.dallah_course_code,
              language: "arabic",
              category: replacement.new.licence_type,
            },
          };
        }
      }
      return HttpResponse.json({ message: "Enrollment replaced" });
    },
  ),

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════════════════════════════════════

  http.get(url("/attendance"), async () => {
    await delay(500);
    return HttpResponse.json(MOCK_ATTENDANCE);
  }),

  http.get(url("/notifications"), async () => {
    await delay(400);
    return HttpResponse.json({
      notifications: [
        {
          id: 1,
          event_type: "enrollment_outcome",
          created_at: "2026-03-01T09:00:00Z",
          enrollment: {
            aanaab_user_id: 1,
            enrollment_id: 1,
            workflow_state: "active",
            total_progress: 0.25,
          },
        },
        {
          id: 2,
          event_type: "enrollment_outcome",
          created_at: "2026-03-05T11:30:00Z",
          enrollment: {
            aanaab_user_id: 2,
            enrollment_id: 2,
            workflow_state: "completed",
            total_progress: 1.0,
          },
        },
        {
          id: 3,
          event_type: "enrollment_outcome",
          created_at: "2026-03-08T14:00:00Z",
          enrollment: {
            aanaab_user_id: 3,
            enrollment_id: 3,
            workflow_state: "active",
            total_progress: 0.6,
          },
        },
      ],
      meta: { count: 3, has_more: false },
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // LOOKUPS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get(url("/languages"), async () => {
    await delay(300);
    return HttpResponse.json({
      languages: [
        { code: "1", name: "arabic", locale: "ar" },
        { code: "2", name: "english", locale: "en" },
        { code: "3", name: "ardu", locale: "ur" },
        { code: "4", name: "hendi", locale: "hi" },
      ],
    });
  }),

  http.get(url("/courses"), async () => {
    await delay(300);
    return HttpResponse.json({
      courses: [
        { id: 1, course_name: "دليل تعليم القيادة النظري - متقدم (عربي)", dallah_course_code: "P6h", language: "arabic", category: "private" },
        { id: 2, course_name: "Private 15 hours - Arabic", dallah_course_code: "P15h", language: "arabic", category: "private" },
        { id: 3, course_name: "Private 30 hours - Arabic", dallah_course_code: "P30h", language: "arabic", category: "private" },
        { id: 4, course_name: "Motor 6 hours - Arabic", dallah_course_code: "M6h", language: "arabic", category: "motor" },
        { id: 5, course_name: "Private 6 hours - English", dallah_course_code: "P6h-en", language: "english", category: "private" },
        { id: 6, course_name: "Public with License - Arabic", dallah_course_code: "PUB-L", language: "arabic", category: "public" },
      ],
    });
  }),

  http.get(url("/branches"), async () => {
    await delay(300);
    return HttpResponse.json({
      branches: [
        { id: 22, branch_id: 2432, branch_name: "مدرسة التخصصي", section_id: 798, section_name: "منطقة الرياض" },
        { id: 23, branch_id: 2434, branch_name: "مدرسة جدة", section_id: 799, section_name: "منطقة مكة المكرمة" },
        { id: 24, branch_id: 2433, branch_name: "مدرسة الطائف", section_id: 799, section_name: "منطقة مكة المكرمة" },
      ],
    });
  }),
];
