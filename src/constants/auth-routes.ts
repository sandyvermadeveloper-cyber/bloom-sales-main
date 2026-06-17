export const authRoutes = {
  login: "/login",
  loginVerify: "/login/verify",
  forgotPassword: "/forgot-password",
  resetPassword: "/admin-reset-password",
  mobileResetPassword: "/reset-password",
  invite: "/invite",
  home: "/",
} as const

export const resetPasswordRedirectDelayMs = 1800
