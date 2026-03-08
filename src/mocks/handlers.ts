import { http, HttpResponse, delay } from "msw";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "@/features/auth/types";

// Helper to construct the full URL
// If NEXT_PUBLIC_API_URL exists, we mock those full endpoints
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const url = (path: string) => `${baseUrl}${path}`;

// Mock internal DB state
let _mockIsAuthenticated = false;

const MOCK_USER: AuthUser = {
  id: "user-dev-1",
  email: "test@example.com",
  name: "Mock Developer User",
};

export const handlers = [
  // LOGIN
  http.post<never, LoginCredentials, LoginResponse | { message: string }>(
    url("/auth/login"),
    async ({ request }) => {
      // Artificially delay responses to simulate network latency in dev
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

      // Validating token presence as a basic mock check
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
];
