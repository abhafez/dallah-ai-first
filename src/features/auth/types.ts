export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export interface LoginResponse {
  token: string;
  admin: AuthUser;
}
