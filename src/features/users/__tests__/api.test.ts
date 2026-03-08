import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosInstance } from "@/lib/axios";
import { 
  createUserApi, 
  searchUsersApi, 
  createEnrollmentApi,
  deleteEnrollmentApi
} from "../api";

vi.mock("@/lib/axios", () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createUserApi should call axios post with payload", async () => {
    const payload = {
      name: "Test",
      mobile: "0512345678",
      nationalId: "1234567890",
      language: "ar" as const,
      level: "beginner" as const,
      vehicle: "sedan" as const,
    };
    const responseData = { id: "u1", ...payload };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: responseData });

    const result = await createUserApi(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/users", payload);
    expect(result).toEqual(responseData);
  });

  it("searchUsersApi should call axios get with query params", async () => {
    const query = "Ahmed";
    const responseData = [{ id: "u1", name: "Ahmed" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: responseData });

    const result = await searchUsersApi(query);
    expect(axiosInstance.get).toHaveBeenCalledWith("/users/search", {
      params: { q: query },
    });
    expect(result).toEqual(responseData);
  });

  it("createEnrollmentApi should call axios post with payload", async () => {
    const payload = {
      userId: "u1",
      language: "ar" as const,
      level: "beginner" as const,
      vehicle: "sedan" as const,
    };
    const responseData = { id: "e1", ...payload };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: responseData });

    const result = await createEnrollmentApi(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/enrollments", payload);
    expect(result).toEqual(responseData);
  });

  it("deleteEnrollmentApi should call axios delete with ID", async () => {
    const enrollmentId = "e123";
    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({});

    await deleteEnrollmentApi(enrollmentId);
    expect(axiosInstance.delete).toHaveBeenCalledWith(`/enrollments/${enrollmentId}`);
  });
});
