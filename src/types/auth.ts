export const roles = ["admin", "manager", "sales", "support", "telecaller"] as const

export type AdminRole = (typeof roles)[number]

export type AdminProfile = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  displayName: string | null
  email: string
  phone: string
  role: AdminRole
  status: "invited" | "active" | "suspended" | "archived"
  mustChangePassword: boolean
  lastLoginAt: string | null
}

export type AdminAuthData = {
  employee: AdminProfile
}

export type AdminSessionData = {
  employee: AdminProfile
}

export type AdminLoginChallenge = {
  challengeId: string
  expiresAt: string
  resendAvailableAt: string
  maskedDestination: string
  devOtp?: string
}
