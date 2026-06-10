import {
  defaultLeadPageSize,
  leadPageSizeOptions,
  leadPriorities,
  leadPriorityLabels,
  leadQualifications,
  leadQualificationLabels,
  leadStatuses,
  leadStatusLabels,
} from "@/components/leads/leads.constants"
import type { LeadFormValues, LeadUpdateFormValues } from "@/schemas/lead.schemas"
import type { CreateLeadInput, Lead, LeadPriority, LeadQualification, LeadStatus, UpdateLeadInput } from "@/types/lead"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatDisplayName, formatTitleCase } from "@/utils/display-format"

export const parseLeadPage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseLeadLimit = (value: string | null): (typeof leadPageSizeOptions)[number] => {
  const limit = Number(value)
  return leadPageSizeOptions.includes(limit as (typeof leadPageSizeOptions)[number])
    ? (limit as (typeof leadPageSizeOptions)[number])
    : defaultLeadPageSize
}

export const normalizeLeadSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const parseLeadStatus = (value: string | null): LeadStatus | "all" => {
  return leadStatuses.includes(value as LeadStatus) ? (value as LeadStatus) : "all"
}

export const parseLeadPriority = (value: string | null): LeadPriority | "all" => {
  return leadPriorities.includes(value as LeadPriority) ? (value as LeadPriority) : "all"
}

export const parseLeadQualification = (value: string | null): LeadQualification | "all" => {
  return leadQualifications.includes(value as LeadQualification) ? (value as LeadQualification) : "all"
}

export const getLeadTitle = (lead: Lead) => {
  return formatTitleCase(lead.title || "Untitled lead")
}

export const getLeadSourceName = (lead: Lead) => {
  return formatTitleCase(lead.source?.label || lead.source?.name || "-")
}

export const getLeadOwnerName = (lead: Lead) => {
  return formatDisplayName(lead.owner?.name || "-")
}

export const getLeadPrimaryContact = (lead: Lead) => {
  return lead.primaryContact ?? lead.contacts?.[0] ?? null
}

export const getLeadServicesLabel = (lead: Lead) => {
  if (!lead.services?.length) return "-"

  return lead.services.map((service) => formatTitleCase(service.label || service.name || service.id)).join(", ")
}

export const getLeadStatusLabel = (status?: string) => {
  if (!status) return "-"

  return leadStatusLabels[status] ?? status.replaceAll("_", " ")
}

export const getLeadPriorityLabel = (priority?: string) => {
  if (!priority) return "-"

  return leadPriorityLabels[priority] ?? priority.replaceAll("_", " ")
}

export const getLeadQualificationLabel = (qualification?: string) => {
  if (!qualification) return "-"

  return leadQualificationLabels[qualification] ?? qualification.replaceAll("_", " ")
}

export const getLeadApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const formatLeadDate = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const formatLeadCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-"

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value)
}

export const leadToUpdateFormValues = (lead: Lead): LeadUpdateFormValues => ({
  title: lead.title ?? "",
  sourceId: lead.source?.id ?? "",
  summary: lead.summary ?? "",
  budgetMin: lead.budgetMin === null || lead.budgetMin === undefined ? "" : String(lead.budgetMin),
  budgetMax: lead.budgetMax === null || lead.budgetMax === undefined ? "" : String(lead.budgetMax),
  priority: lead.priority === "LOW" || lead.priority === "MEDIUM" || lead.priority === "HIGH" || lead.priority === "URGENT"
    ? lead.priority
    : "HIGH",
  qualification:
    lead.qualification === "COLD" || lead.qualification === "WARM" || lead.qualification === "HOT"
      ? lead.qualification
      : "WARM",
  expectedClosingDate: lead.expectedClosingDate ? lead.expectedClosingDate.slice(0, 10) : "",
})

export const leadFormToCreateInput = (values: LeadFormValues): CreateLeadInput => ({
  title: values.title,
  sourceId: values.sourceId,
  serviceIds: values.serviceIds,
  newContacts: values.newContacts.length
    ? values.newContacts.map((contact) => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        designation: contact.designation || undefined,
        phones: contact.phones.map((phone) => ({
          phone: phone.phone,
          label: phone.label,
        })),
        emails: contact.emails.map((email) => ({
          email: email.email,
          label: email.label,
        })),
      }))
    : undefined,
  summary: values.summary || undefined,
  budgetMin: values.budgetMin ? Number(values.budgetMin) : undefined,
  budgetMax: values.budgetMax ? Number(values.budgetMax) : undefined,
  priority: values.priority,
  qualification: values.qualification,
  expectedClosingDate: values.expectedClosingDate
    ? new Date(`${values.expectedClosingDate}T00:00:00.000Z`).toISOString()
    : undefined,
})

export const leadFormToUpdateInput = (values: LeadUpdateFormValues): UpdateLeadInput => ({
  title: values.title,
  sourceId: values.sourceId,
  summary: values.summary || undefined,
  budgetMin: values.budgetMin ? Number(values.budgetMin) : undefined,
  budgetMax: values.budgetMax ? Number(values.budgetMax) : undefined,
  priority: values.priority,
  qualification: values.qualification,
  expectedClosingDate: values.expectedClosingDate
    ? new Date(`${values.expectedClosingDate}T00:00:00.000Z`).toISOString()
    : undefined,
})
