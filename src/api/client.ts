"use client"

import axios, { AxiosError, type AxiosRequestConfig } from "axios"

import type { ApiErrorBody } from "@/types/api"
import { getLoginPathWithRedirect } from "@/utils/auth-redirect"

const refreshableAuthCodes = new Set([
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "AUTH_REQUIRED",
  "AUTHENTICATION_ERROR",
])

let refreshRequest: Promise<void> | null = null
let isHandlingAuthFailure = false

const getValidationErrorMessage = (
  message: string,
  code: string,
  status: number | undefined,
  fieldErrors: NonNullable<ApiErrorBody["data"]>["errors"] | undefined
) => {
  if ((status === 422 || code === "VALIDATION_ERROR") && fieldErrors?.length) {
    return fieldErrors.map((fieldError) => fieldError.message).join(", ")
  }

  return message
}

export class ApiClientError extends Error {
  code: string
  status?: number
  requestId?: string
  fieldErrors: NonNullable<ApiErrorBody["data"]>["errors"]

  constructor(input: {
    message: string
    code: string
    status?: number
    requestId?: string
    fieldErrors?: NonNullable<ApiErrorBody["data"]>["errors"]
  }) {
    super(getValidationErrorMessage(input.message, input.code, input.status, input.fieldErrors))
    this.name = "ApiClientError"
    this.code = input.code
    this.status = input.status
    this.requestId = input.requestId
    this.fieldErrors = input.fieldErrors
  }
}

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

const refreshAdminSession = async () => {
  refreshRequest ??= apiClient
    .post("/api/v1/admin/auth/refresh", undefined, { skipAuthRefresh: true })
    .then(() => undefined)
    .finally(() => {
      refreshRequest = null
    })

  return refreshRequest
}

const clearClientAuthState = () => {
  if (typeof window === "undefined") return
  if (isHandlingAuthFailure) return
  isHandlingAuthFailure = true

  void import("@/stores/auth.store").then(({ useAuthStore }) => {
    useAuthStore.getState().clearSession()
  })

  if (window.location.pathname !== "/login") {
    window.location.replace(getLoginPathWithRedirect(`${window.location.pathname}${window.location.search}`))
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined
    const status = error.response?.status
    const code = error.response?.data?.code

    if (
      status === 401 &&
      (!code || refreshableAuthCodes.has(code)) &&
      originalRequest &&
      !originalRequest._retryAuth &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retryAuth = true

      try {
        await refreshAdminSession()
        return apiClient(originalRequest)
      } catch {
        clearClientAuthState()
        throw new ApiClientError({
          message: "Your session has expired. Please sign in again.",
          code: "AUTHENTICATION_ERROR",
          status: 401,
          requestId: error.response?.data?.requestId,
          fieldErrors: error.response?.data?.data?.errors,
        })
      }
    }

    const body = error.response?.data
    throw new ApiClientError({
      message: body?.message || "Something went wrong. Please try again.",
      code: body?.code || "REQUEST_FAILED",
      status,
      requestId: body?.requestId,
      fieldErrors: body?.data?.errors,
    })
  }
)
