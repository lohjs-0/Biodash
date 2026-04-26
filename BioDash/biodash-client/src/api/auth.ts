import client from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    client.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  deleteAccount: (password: string) =>
    client.delete("/users/me", {
      data: { password },
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.put("/users/me/password", { currentPassword, newPassword }).then((r) => r.data),
};