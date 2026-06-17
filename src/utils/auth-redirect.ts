import { authRoutes } from "@/constants/auth-routes"

const publicRoutes = new Set<string>([
  authRoutes.login,
  authRoutes.loginVerify,
  authRoutes.forgotPassword,
  authRoutes.resetPassword,
  authRoutes.mobileResetPassword,
])

const isSafeInternalPath = (value: string) =>
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.includes("\\") &&
  !/^[a-z][a-z\d+.-]*:/i.test(value)

export const getSafeRedirectPath = (value: string | null | undefined) => {
  if (!value || !isSafeInternalPath(value)) return authRoutes.home

  const pathname = value.split(/[?#]/, 1)[0] || authRoutes.home

  if (publicRoutes.has(pathname)) return authRoutes.home

  return value
}

export const getLoginPathWithRedirect = (redirectPath: string) => {
  const safeRedirectPath = getSafeRedirectPath(redirectPath)

  if (safeRedirectPath === authRoutes.home) return authRoutes.login

  return `${authRoutes.login}?redirect=${encodeURIComponent(safeRedirectPath)}`
}

export const withRedirectParam = (path: string, redirectPath: string | null | undefined) => {
  const safeRedirectPath = getSafeRedirectPath(redirectPath)

  if (safeRedirectPath === authRoutes.home) return path

  return `${path}?redirect=${encodeURIComponent(safeRedirectPath)}`
}
