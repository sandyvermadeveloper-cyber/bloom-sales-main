import { getApiErrorMessage } from "@/utils/api-error"
import { formatDisplayName } from "@/utils/display-format"
import type { Contact } from "@/types/contact"
import type { ContactProfileFormValues } from "@/schemas/contact.schemas"

export const parseContactPage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseContactLimit = <T extends readonly number[]>(
  value: string | null,
  options: T,
  fallback: T[number]
) => {
  const limit = Number(value)
  return options.includes(limit) ? (limit as T[number]) : fallback
}

export const normalizeContactSearch = (value: string | null | undefined) => {
  return (value ?? "").trim()
}

export const getContactApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const getContactName = (contact: Contact | null | undefined) => {
  if (!contact) return "-"
  const composedName = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim()
  return formatDisplayName(contact.fullName || composedName || contact.id)
}

export const getContactInitials = (contact: Contact) => {
  return getContactName(contact)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C"
}

export const formatContactDate = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const contactToProfileValues = (contact: Contact | null): ContactProfileFormValues => {
  const nameParts = (contact?.fullName ?? "").trim().split(/\s+/).filter(Boolean)

  return {
    firstName: contact?.firstName || nameParts[0] || "",
    lastName: contact?.lastName || nameParts.slice(1).join(" ") || "",
    designation: contact?.designation || "",
  }
}
