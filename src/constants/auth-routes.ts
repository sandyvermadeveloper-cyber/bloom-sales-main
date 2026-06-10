export const authRoutes = {
  login: "/login",
  loginVerify: "/login/verify",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  home: "/",
} as const

export const resetPasswordRedirectDelayMs = 1800
