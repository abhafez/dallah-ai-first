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

  it("createUserApi should call axios post and return mapped User", async () => {
    const payload = {
      name: "Test",
      mobile: "+966512345678",
      national_id: "1234567890",
      school_id: 3,
      lang: "1",
      courses: [{ dallah_course_code: "P6h", licence_type: "private" as const }],
    };
    const apiResponse = {
      id: 1,
      name: "Test",
      mobile_number: "+966512345678",
      national_id: "1234567890",
      email: "",
      lang: "ar",
      status: "created",
      organization_branch_id: 3,
      enrollments: [],
    };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: apiResponse });

    const result = await createUserApi(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/users", payload);
    expect(result.name).toBe("Test");
    expect(result.nationalId).toBe("1234567890");
    expect(result.mobile).toBe("+966512345678");
  });

  it("searchUsersApi should call axios get /users with query params and unwrap response", async () => {
    const query = "Ahmed";
    const mockApiUser = {
      id: 1,
      name: "Ahmed",
      national_id: "1234567890",
      mobile_number: "+966501234567",
      email: "ahmed@example.com",
      lang: "ar",
      status: "created",
      organization_branch_id: 3,
      enrollments: [],
    };
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: { users: [mockApiUser] } });

    const result = await searchUsersApi(query);
    expect(axiosInstance.get).toHaveBeenCalledWith("/users", {
      params: { q: query },
    });
    expect(result[0].name).toBe("Ahmed");
    expect(result[0].nationalId).toBe("1234567890");
  });

  it("createEnrollmentApi should call axios post with national_id and courses array", async () => {
    const payload = {
      national_id: "1234567890",
      lang: "1",
      licence_type: "private" as const,
      dallah_course_code: "P6h",
    };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: {} });

    await createEnrollmentApi(payload);
    expect(axiosInstance.post).toHaveBeenCalledWith("/enrollments", {
      national_id: "1234567890",
      courses: [{ dallah_course_code: "P6h", lang: "1", licence_type: "private" }],
    });
  });

  it("deleteEnrollmentApi should call axios delete with body payload", async () => {
    const payload = {
      national_id: "1234567890",
      dallah_course_code: "P6h",
      lang: "1",
      licence_type: "private" as const,
    };
    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({});

    await deleteEnrollmentApi(payload);
    expect(axiosInstance.delete).toHaveBeenCalledWith("/enrollments", {
      data: {
        national_id: "1234567890",
        courses: [{ dallah_course_code: "P6h", lang: "1", licence_type: "private" }],
      },
    });
  });
});
