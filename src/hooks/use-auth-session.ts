"use client"

import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { ApiClientError } from "@/api/client"
import { useAuthStore } from "@/stores/auth.store"
import type { ApiErrorBody } from "@/types/api"
import { getLoginPathWithRedirect } from "@/utils/auth-redirect"

const authFailureCodes = new Set([
  "AUTHENTICATION_ERROR",
  "AUTH_REQUIRED",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "REFRESH_TOKEN_REQUIRED",
  "INVALID_REFRESH_TOKEN",
  "REFRESH_TOKEN_EXPIRED",
])

export const isAuthFailureError = (error: unknown) =>
  (error instanceof ApiClientError && authFailureCodes.has(error.code)) ||
  (axios.isAxiosError<ApiErrorBody>(error) &&
    Boolean(error.response?.data?.code && authFailureCodes.has(error.response.data.code)))

export const useAuthSession = () => {
  const router = useRouter()
  const employee = useAuthStore((state) => state.employee)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const hasRedirectedRef = useRef(false)
  const hasStartedRestoreRef = useRef(false)
  const [hasCheckedSession, setHasCheckedSession] = useState(false)
  const hasResolvedSession = hasCheckedSession || isAuthenticated

  useEffect(() => {
    if (isAuthenticated) {
      return
    }

    if (hasStartedRestoreRef.current) return

    hasStartedRestoreRef.current = true
    void restoreSession().finally(() => {
      setHasCheckedSession(true)
    })
  }, [isAuthenticated, restoreSession])

  useEffect(() => {
    if (!hasResolvedSession || isLoading || isAuthenticated || hasRedirectedRef.current) return

    hasRedirectedRef.current = true
    router.replace(getLoginPathWithRedirect(`${window.location.pathname}${window.location.search}`))
  }, [hasResolvedSession, isAuthenticated, isLoading, router])

  return {
    employee,
    isAuthenticated,
    isLoading: isLoading || !hasResolvedSession,
    restoreSession,
    isAuthFailure: hasResolvedSession && !isLoading && !isAuthenticated,
    isRedirectingToLogin: hasResolvedSession && !isLoading && !isAuthenticated,
    isError: false,
    refetch: restoreSession,
  }
}
