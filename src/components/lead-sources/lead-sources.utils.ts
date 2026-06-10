import {
  defaultLeadSourcePageSize,
  leadSourcePageSizeOptions,
} from "@/components/lead-sources/lead-sources.constants"
import type { LeadSourceFormValues } from "@/schemas/lead-source.schemas"
import type { LeadSource } from "@/types/lead-source"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatDescription, formatTitleCase } from "@/utils/display-format"

export const parseLeadSourcePage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseLeadSourceLimit = (
  value: string | null
): (typeof leadSourcePageSizeOptions)[number] => {
  const limit = Number(value)
  return leadSourcePageSizeOptions.includes(limit as (typeof leadSourcePageSizeOptions)[number])
    ? (limit as (typeof leadSourcePageSizeOptions)[number])
    : defaultLeadSourcePageSize
}

export const normalizeLeadSourceSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const getLeadSourceName = (leadSource: LeadSource) => {
  return formatTitleCase(leadSource.name || leadSource.label || "Unnamed lead source")
}

export const getLeadSourceDescription = (leadSource: LeadSource) => {
  return formatDescription(leadSource.description)
}

export const leadSourceToFormValues = (leadSource: LeadSource): LeadSourceFormValues => ({
  name: leadSource.name || leadSource.label || "",
  description: leadSource.description ?? "",
})

export const getLeadSourceApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const formatLeadSourceDate = (value?: string) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
