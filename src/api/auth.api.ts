import { apiClient } from "@/api/client"
import type { AdminAuthData, AdminLoginChallenge } from "@/types/auth"
import type { ApiSuccess } from "@/types/api"

export type LoginAdminInput = {
  identifier: string
  password: string
}

export type VerifyAdminOtpInput = {
  challengeId: string
  otp: string
}

export type ForgotAdminPasswordInput = {
  identifier: string
}

export type VerifyAdminResetTokenInput = {
  token: string
}

export type ResetAdminPasswordInput = {
  token: string
  password: string
}

export type ChangeAdminPasswordInput = {
  currentPassword: string
  newPassword: string
}

export const adminAuthApi = {
  async login(input: LoginAdminInput) {
    const response = await apiClient.post<ApiSuccess<AdminLoginChallenge>>(
      "/api/v1/admin/auth/login",
      input,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async verifyOtp(input: VerifyAdminOtpInput) {
    const response = await apiClient.post<ApiSuccess<AdminAuthData>>(
      "/api/v1/admin/auth/login/verify-otp",
      input,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async resendOtp(challengeId: string) {
    const response = await apiClient.post<ApiSuccess<AdminLoginChallenge>>(
      "/api/v1/admin/auth/login/resend-otp",
      { challengeId },
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async forgotPassword(input: ForgotAdminPasswordInput) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/forgot-password",
      input,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async verifyResetToken(input: VerifyAdminResetTokenInput) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/verify-reset-token",
      input,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async resetPassword(input: ResetAdminPasswordInput) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/reset-password",
      input,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async changePassword(input: ChangeAdminPasswordInput) {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/change-password",
      input
    )
    return response.data
  },

  async me() {
    const response = await apiClient.get<ApiSuccess<{ employee: AdminAuthData["employee"] }>>(
      "/api/v1/admin/auth/me"
    )
    return response.data
  },

  async refresh() {
    const response = await apiClient.post<ApiSuccess<AdminAuthData>>(
      "/api/v1/admin/auth/refresh",
      undefined,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async logout() {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/logout",
      undefined,
      { skipAuthRefresh: true }
    )
    return response.data
  },

  async logoutAll() {
    const response = await apiClient.post<ApiSuccess<null>>(
      "/api/v1/admin/auth/logout-all",
      undefined,
      { skipAuthRefresh: true }
    )
    return response.data
  },
}
