import type { Lead } from "@/types/lead"

export type ContactLabel = "WORK" | "PERSONAL"

export type ContactPhone = {
  id?: string
  phone: string
  label: ContactLabel | string
  isPrimary?: boolean
}

export type ContactEmail = {
  id?: string
  email: string
  label: ContactLabel | string
  isPrimary?: boolean
}

export type Contact = {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  designation?: string | null
  primaryPhone?: string | null
  primaryEmail?: string | null
  phones?: ContactPhone[]
  emails?: ContactEmail[]
  relatedLeads?: Array<Pick<Lead, "id" | "leadNumber" | "title" | "status">>
  relatedCustomers?: unknown[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type ListContactsQuery = {
  page: number
  limit: number
  search?: string
  phone?: string
  email?: string
}

export type ContactProfileInput = {
  firstName: string
  lastName?: string
  designation?: string
}

export type ContactPhoneInput = {
  phone: string
  label: ContactLabel
}

export type ContactEmailInput = {
  email: string
  label: ContactLabel
}

export type ContactsPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListContactsData = {
  contacts: Contact[]
  pagination: ContactsPagination
}

export type ContactData = Contact | { id: string } | null
