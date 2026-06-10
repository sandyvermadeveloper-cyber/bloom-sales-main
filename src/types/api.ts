export type ApiSuccess<T> = {
  success: true
  code: string
  message: string
  data: T
  requestId: string
}

export type ApiFieldError = {
  field: string
  message: string
}

export type ApiErrorBody = {
  success: false
  code: string
  message: string
  requestId?: string
  data?: {
    errors?: ApiFieldError[]
  } | null
}
