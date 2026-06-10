import { ApiClientError } from "@/api/client"

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    if (
      (error.status === 422 || error.code === "VALIDATION_ERROR") &&
      error.fieldErrors?.length
    ) {
      return error.fieldErrors.map((fieldError) => fieldError.message).join(", ")
    }

    return error.message
  }

  return fallback
}

export const getAuthErrorMessage = (error: unknown) => {
  return getApiErrorMessage(error, "Something went wrong. Please try again.")
}
