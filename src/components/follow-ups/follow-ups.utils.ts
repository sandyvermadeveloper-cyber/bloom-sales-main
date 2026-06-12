import {
  defaultFollowUpPageSize,
  followUpOutcomeLabels,
  followUpPageSizeOptions,
  followUpStatusLabels,
  followUpStatuses,
  followUpTypeLabels,
  followUpViews,
} from "@/components/follow-ups/follow-ups.constants"
import type { FollowUpFormValues, FollowUpUpdateFormValues } from "@/schemas/follow-up.schemas"
import type { CreateFollowUpInput, FollowUp, FollowUpStatus, FollowUpView, UpdateFollowUpInput } from "@/types/follow-up"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatDisplayName, formatTitleCase } from "@/utils/display-format"

export const parseFollowUpPage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseFollowUpLimit = (value: string | null): (typeof followUpPageSizeOptions)[number] => {
  const limit = Number(value)
  return followUpPageSizeOptions.includes(limit as (typeof followUpPageSizeOptions)[number])
    ? (limit as (typeof followUpPageSizeOptions)[number])
    : defaultFollowUpPageSize
}

export const normalizeFollowUpSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const parseFollowUpStatus = (value: string | null): FollowUpStatus | "all" => {
  return followUpStatuses.includes(value as FollowUpStatus) ? (value as FollowUpStatus) : "all"
}

export const parseFollowUpView = (value: string | null): FollowUpView => {
  return followUpViews.includes(value as FollowUpView) ? (value as FollowUpView) : "inbox"
}

export const getFollowUpApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const getFollowUpTypeLabel = (type?: string | null, customType?: string | null) => {
  if (!type) return "-"

  if (type === "OTHER" && customType) {
    return formatTitleCase(customType)
  }

  return followUpTypeLabels[type] ?? type.replaceAll("_", " ")
}

export const getFollowUpStatusLabel = (status?: string | null) => {
  if (!status) return "-"

  return followUpStatusLabels[status] ?? status.replaceAll("_", " ")
}

export const getFollowUpOutcomeLabel = (outcome?: string | null) => {
  if (!outcome) return "-"

  return followUpOutcomeLabels[outcome] ?? outcome.replaceAll("_", " ")
}

export const getFollowUpAssigneeName = (followUp: FollowUp) => {
  return followUp.assignedTo?.name ? formatDisplayName(followUp.assignedTo.name) : "Unassigned"
}

export const getFollowUpCreatedByName = (followUp: FollowUp) => {
  return followUp.createdBy?.name ? formatDisplayName(followUp.createdBy.name) : "-"
}

export const getFollowUpLeadLabel = (followUp: FollowUp) => {
  const lead = followUp.lead
  if (!lead) return "-"

  return formatTitleCase(lead.label || lead.title || lead.leadNumber || lead.id)
}

export const getFollowUpContactName = (followUp: FollowUp) => {
  return followUp.primaryContact?.fullName ? formatDisplayName(followUp.primaryContact.fullName) : "-"
}

export const formatFollowUpDate = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const formatFollowUpDateTime = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  const local = new Date(date.getTime() - offsetMs)
  return local.toISOString().slice(0, 16)
}

export const fromDateTimeInputValue = (value: string) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString()
}

export const getClientTimezoneOffset = () => new Date().getTimezoneOffset()

export const followUpFormToCreateInput = (values: FollowUpFormValues): CreateFollowUpInput => ({
  leadId: values.leadId,
  type: values.type,
  customType: values.type === "OTHER" ? values.customType || undefined : undefined,
  scheduledAt: fromDateTimeInputValue(values.scheduledAt),
  notes: values.notes || undefined,
  assignedToEmployeeId: values.assignedToEmployeeId || undefined,
})

export const followUpFormToUpdateInput = (values: FollowUpUpdateFormValues): UpdateFollowUpInput => ({
  type: values.type,
  customType: values.type === "OTHER" ? values.customType || undefined : undefined,
  scheduledAt: fromDateTimeInputValue(values.scheduledAt),
  notes: values.notes || undefined,
  assignedToEmployeeId: values.assignedToEmployeeId || undefined,
})
