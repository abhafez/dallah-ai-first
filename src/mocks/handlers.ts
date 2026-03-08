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
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const url = (path: string) => `${baseUrl}${path}`;

// ──────────────────────────────────────────────────────────────────────────────
// Mock internal DB state
// ──────────────────────────────────────────────────────────────────────────────
let _mockIsAuthenticated = false;
let _nextUserId = 4;
let _nextEnrollmentId = 4;

const MOCK_USER: AuthUser = {
  id: "user-dev-1",
  email: "test@example.com",
  name: "Mock Developer User",
};

const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Ahmed Al-Rashid",
    mobile: "0512345678",
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
    mobile: "0587654321",
    nationalId: "0987654321",
    language: "ar",
    level: "intermediate",
    vehicle: "suv",
    branch: "Jeddah",
    createdAt: "2026-02-10T08:30:00Z",
  },
  {
    id: "u3",
    name: "John Smith",
    mobile: "0555555555",
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
    language: "ar",
    level: "beginner",
    vehicle: "sedan",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "e2",
    userId: "u2",
    courseTitle: "Advanced Driving Skills",
    courseId: "c2",
    language: "ar",
    level: "intermediate",
    vehicle: "suv",
    createdAt: "2026-02-10T08:30:00Z",
  },
  {
    id: "e3",
    userId: "u3",
    courseTitle: "Commercial Vehicle Training",
    courseId: "c3",
    language: "en",
    level: "advanced",
    vehicle: "truck",
    createdAt: "2026-03-01T14:00:00Z",
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
  http.post<never, LoginCredentials, LoginResponse | { message: string }>(
    url("/auth/login"),
    async ({ request }) => {
      await delay(800);
      const body = await request.json();
      if (body.email === "wrong@example.com") {
        return HttpResponse.json(
          { message: "Invalid credentials. Please try again." },
          { status: 400 }
        );
      }
      _mockIsAuthenticated = true;
      return HttpResponse.json({
        user: MOCK_USER,
        token: "mock-jwt-token-12345",
      });
    }
  ),

  // GET ME
  http.get<never, never, AuthUser | { message: string }>(
    url("/auth/me"),
    async ({ request }) => {
      await delay(400);
      const authHeader = request.headers.get("Authorization");
      if (!_mockIsAuthenticated && !authHeader?.includes("Bearer")) {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return HttpResponse.json(MOCK_USER);
    }
  ),

  // LOGOUT
  http.post(url("/auth/logout"), async () => {
    await delay(400);
    _mockIsAuthenticated = false;
    return new HttpResponse(null, { status: 200 });
  }),

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
        (u) => u.nationalId === body.nationalId || u.mobile === body.mobile
      );
      if (duplicate) {
        return HttpResponse.json(
          { message: "User with this national ID or mobile already exists." },
          { status: 409 }
        );
      }

      const newUser: User = {
        id: `u${_nextUserId++}`,
        ...body,
        branch: "Default",
        createdAt: new Date().toISOString(),
      };
      MOCK_USERS.push(newUser);

      // Auto-create an enrollment
      const enrollment: Enrollment = {
        id: `e${_nextEnrollmentId++}`,
        userId: newUser.id,
        courseTitle: `Course for ${body.level} ${body.vehicle}`,
        courseId: `c-auto-${newUser.id}`,
        language: body.language,
        level: body.level,
        vehicle: body.vehicle,
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
        courseTitle: `Course for ${body.level} ${body.vehicle}`,
        courseId: `c-new-${Date.now()}`,
        language: body.language,
        level: body.level,
        vehicle: body.vehicle,
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
        courseTitle: `Course for ${body.level} ${body.vehicle}`,
        courseId: `c-replaced-${Date.now()}`,
        language: body.language,
        level: body.level,
        vehicle: body.vehicle,
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
];
