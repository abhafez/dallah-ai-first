import { http, HttpResponse, delay } from "msw";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  BulkUploadResponse,
  Enrollment,
  CreateEnrollmentPayload,
  ReplaceEnrollmentPayload,
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
let _nextEnrollmentId = 4;

const MOCK_USER: AuthUser = {
  id: 1,
  email: "ksaleh@gmail.com",
  name: "K Saleh",
  role: "super_admin",
};

const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Ahmed Al-Rashid",
    mobile: "+966512345678",
    nationalId: "1234567890",
    language: "ar",
    level: "beginner",
    vehicle: "sedan",
    branch: "Riyadh",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "u2",
    name: "Sara Mohammad",
    mobile: "+966587654321",
    nationalId: "2098765432",
    language: "ar",
    level: "intermediate",
    vehicle: "suv",
    branch: "Jeddah",
    createdAt: "2026-02-10T08:30:00Z",
  },
  {
    id: "u3",
    name: "John Smith",
    mobile: "+966555555555",
    nationalId: "1122334455",
    language: "en",
    level: "advanced",
    vehicle: "truck",
    branch: "Dammam",
    createdAt: "2026-03-01T14:00:00Z",
  },
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "e1",
    userId: "u1",
    courseTitle: "Defensive Driving - Level 1",
    courseId: "c1",
    lang: "1",
    licence_type: "private",
    course_code: "P30h",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "e2",
    userId: "u2",
    courseTitle: "Advanced Driving Skills",
    courseId: "c2",
    lang: "1",
    licence_type: "private",
    course_code: "P15h",
    createdAt: "2026-02-15T11:00:00Z",
  },
  {
    id: "e3",
    userId: "u3",
    courseTitle: "Commercial Vehicle Training",
    courseId: "c3",
    lang: "2",
    licence_type: "public",
    course_code: "PUB-L",
    createdAt: "2026-03-05T15:30:00Z",
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

  // CREATE USER
  http.post<never, CreateUserPayload, User | { message: string }>(
    url("/users"),
    async ({ request }) => {
      await delay(600);
      const body = await request.json();

      // Check for duplicate national ID or mobile
      const duplicate = MOCK_USERS.find(
        (u) => u.nationalId === body.national_id || u.mobile === body.mobile
      );
      if (duplicate) {
        return HttpResponse.json(
          { message: "User with this national ID or mobile already exists." },
          { status: 409 }
        );
      }

      const newUser: User = {
        id: `u${_nextUserId++}`,
        name: body.name,
        mobile: body.mobile,
        nationalId: body.national_id,
        language: body.lang === "1" ? "ar" : "en",
        level: (body.courses[0]?.dallah_course_code?.includes("P6") ? "beginner" : "intermediate"),
        vehicle: (body.courses[0]?.licence_type === "motor" ? "motorcycle" : "sedan"),
        branch: `School ${body.school_id}`,
        createdAt: new Date().toISOString(),
      };
      MOCK_USERS.push(newUser);

      // Auto-create an enrollment
      const enrollment: Enrollment = {
        id: `e${_nextEnrollmentId++}`,
        userId: newUser.id,
        courseTitle: `Course ${body.courses[0]?.dallah_course_code}`,
        courseId: `c-auto-${newUser.id}`,
        lang: newUser.language === "ar" ? "1" : "2",
        licence_type: (body.courses[0]?.licence_type || "private"),
        course_code: body.courses[0]?.dallah_course_code || "P6h",
        createdAt: new Date().toISOString(),
      };
      MOCK_ENROLLMENTS.push(enrollment);

      return HttpResponse.json(newUser, { status: 201 });
    }
  ),

  // SEARCH USERS
  http.get(url("/users/search"), async ({ request }) => {
    await delay(400);
    const searchUrl = new URL(request.url);
    const q = searchUrl.searchParams.get("q")?.toLowerCase() || "";
    const results = MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.mobile.includes(q) ||
        u.nationalId.includes(q)
    );
    return HttpResponse.json(results);
  }),

  // UPDATE USER
  http.put<{ id: string }, UpdateUserPayload, User | { message: string }>(
    url("/users/:id"),
    async ({ params, request }) => {
      await delay(500);
      const body = await request.json();
      const userIndex = MOCK_USERS.findIndex((u) => u.id === params.id);
      if (userIndex === -1) {
        return HttpResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      // Check uniqueness for mobile/nationalId
      if (body.mobile || body.nationalId) {
        const duplicate = MOCK_USERS.find(
          (u) =>
            u.id !== params.id &&
            ((body.nationalId && u.nationalId === body.nationalId) ||
              (body.mobile && u.mobile === body.mobile))
        );
        if (duplicate) {
          return HttpResponse.json(
            { message: "Another user already has this national ID or mobile." },
            { status: 409 }
          );
        }
      }

      MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...body };
      return HttpResponse.json(MOCK_USERS[userIndex]);
    }
  ),

  // BULK UPLOAD
  http.post(url("/users/bulk"), async () => {
    await delay(1500);
    // Simulate processing a CSV with some successes and failures
    const response: BulkUploadResponse = {
      totalProcessed: 5,
      successCount: 3,
      failureCount: 2,
      results: [
        { row: 1, name: "Ali Hassan", nationalId: "1111111111", status: "success" },
        { row: 2, name: "Fatima Omar", nationalId: "2222222222", status: "success" },
        { row: 3, name: "Khalid Saeed", nationalId: "3333333333", status: "success" },
        {
          row: 4,
          name: "Nora Ali",
          nationalId: "1234567890",
          status: "error",
          message: "Duplicate national ID",
        },
        {
          row: 5,
          name: "Bad Data",
          nationalId: "invalid",
          status: "error",
          message: "Invalid national ID format",
        },
      ],
    };
    return HttpResponse.json(response);
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ENROLLMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // GET USER ENROLLMENTS
  http.get(url("/users/:id/enrollments"), async ({ params }) => {
    await delay(400);
    const enrollments = MOCK_ENROLLMENTS.filter(
      (e) => e.userId === (params.id as string)
    );
    return HttpResponse.json(enrollments);
  }),

  // CREATE ENROLLMENT
  http.post<never, CreateEnrollmentPayload, Enrollment | { message: string }>(
    url("/enrollments"),
    async ({ request }) => {
      await delay(600);
      const body = await request.json();

      const user = MOCK_USERS.find((u) => u.id === body.userId);
      if (!user) {
        return HttpResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      const enrollment: Enrollment = {
        id: `e${_nextEnrollmentId++}`,
        userId: body.userId,
        courseTitle: `New Course ${body.course_code}`,
        courseId: `c-new-${body.userId}`,
        lang: body.lang,
        licence_type: body.licence_type,
        course_code: body.course_code,
        createdAt: new Date().toISOString(),
      };
      MOCK_ENROLLMENTS.push(enrollment);
      return HttpResponse.json(enrollment, { status: 201 });
    }
  ),

  // DELETE ENROLLMENT
  http.delete(url("/enrollments/:id"), async ({ params }) => {
    await delay(500);
    const index = MOCK_ENROLLMENTS.findIndex(
      (e) => e.id === (params.id as string)
    );
    if (index === -1) {
      return HttpResponse.json(
        { message: "Enrollment not found." },
        { status: 404 }
      );
    }
    MOCK_ENROLLMENTS.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // REPLACE ENROLLMENT
  http.post<never, ReplaceEnrollmentPayload, Enrollment | { message: string }>(
    url("/enrollments/replace"),
    async ({ request }) => {
      await delay(800);
      const body = await request.json();

      // Delete old enrollment
      const oldIndex = MOCK_ENROLLMENTS.findIndex(
        (e) => e.id === body.enrollmentId
      );
      if (oldIndex === -1) {
        return HttpResponse.json(
          { message: "No current enrollment to replace." },
          { status: 404 }
        );
      }
      MOCK_ENROLLMENTS.splice(oldIndex, 1);

      // Create new enrollment
      const enrollment: Enrollment = {
        id: `e${_nextEnrollmentId++}`,
        userId: body.userId,
        courseTitle: `Replaced Course ${body.course_code}`,
        courseId: `c-replaced-${Date.now()}`,
        lang: body.lang,
        licence_type: body.licence_type,
        course_code: body.course_code,
        createdAt: new Date().toISOString(),
      };
      MOCK_ENROLLMENTS.push(enrollment);
      return HttpResponse.json(enrollment);
    }
  ),

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════════════════════════════════════

  http.get(url("/attendance"), async () => {
    await delay(500);
    return HttpResponse.json(MOCK_ATTENDANCE);
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
