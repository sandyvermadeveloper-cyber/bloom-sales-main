import { defaultServicePageSize, servicePageSizeOptions } from "@/components/services/services.constants"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatDescription, formatTitleCase } from "@/utils/display-format"
import type { Service } from "@/types/service"
import type { ServiceFormValues } from "@/schemas/service.schemas"

export const parseServicePage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseServiceLimit = (value: string | null): (typeof servicePageSizeOptions)[number] => {
  const limit = Number(value)
  return servicePageSizeOptions.includes(limit as (typeof servicePageSizeOptions)[number])
    ? (limit as (typeof servicePageSizeOptions)[number])
    : defaultServicePageSize
}

export const normalizeServiceSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const getServiceName = (service: Service) => {
  return formatTitleCase(service.name || service.label || "Unnamed service")
}

export const getServiceDescription = (service: Service) => {
  return formatDescription(service.description)
}

export const serviceToFormValues = (service: Service): ServiceFormValues => ({
  name: service.name || service.label || "",
  description: service.description ?? "",
})

export const getServiceApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const formatServiceDate = (value?: string) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
