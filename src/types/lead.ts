import type { LeadSource } from "@/types/lead-source"
import type { Service } from "@/types/service"
import type { ContactEmail, ContactLabel, ContactPhone } from "@/types/contact"

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "QUALIFIED"
  | "PROPOSAL"
  | "WON"
  | "LOST"

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export type LeadQualification = "COLD" | "WARM" | "HOT"

export type LeadOwner = {
  id: string
  name: string
}

export type LeadContact = {
  id: string
  fullName?: string
  designation?: string | null
  primaryPhone?: string | null
  primaryEmail?: string | null
}

export type Lead = {
  id: string
  leadNumber?: string
  title: string
  summary?: string | null
  status?: LeadStatus | string
  priority?: LeadPriority | string
  qualification?: LeadQualification | string
  budgetMin?: number | null
  budgetMax?: number | null
  expectedClosingDate?: string | null
  owner?: LeadOwner | null
  source?: Pick<LeadSource, "id" | "label" | "name"> | null
  primaryContact?: LeadContact | null
  contacts?: LeadContact[]
  services?: Array<Pick<Service, "id" | "label" | "name">>
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type LeadPhoneInput = {
  phone: string
  label: ContactLabel
}

export type LeadEmailInput = {
  email: string
  label: ContactLabel
}

export type LeadNewContactInput = {
  firstName: string
  lastName: string
  designation?: string
  phones: LeadPhoneInput[]
  emails: LeadEmailInput[]
}

export type CreateLeadInput = {
  title: string
  sourceId: string
  serviceIds: string[]
  newContacts?: LeadNewContactInput[]
  summary?: string
  budgetMin?: number
  budgetMax?: number
  priority: LeadPriority
  qualification: LeadQualification
  expectedClosingDate?: string
}

export type UpdateLeadInput = Partial<
  Pick<
    CreateLeadInput,
    "title" | "sourceId" | "summary" | "budgetMin" | "budgetMax" | "priority" | "qualification" | "expectedClosingDate"
  >
>

export type ListLeadsQuery = {
  page: number
  limit: number
  search?: string
  status?: LeadStatus
  priority?: LeadPriority
  qualification?: LeadQualification
  sourceId?: string
  serviceId?: string
}

export type LeadsPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListLeadsData = {
  leads: Lead[]
  pagination: LeadsPagination
}

export type LeadData = Lead

export type LeadNewContactLinkInput = {
  firstName: string
  lastName?: string
  designation?: string
  phones: LeadPhoneInput[]
  emails?: LeadEmailInput[]
}

export type LeadContactLinkInput = {
  contactId?: string
  newContact?: LeadNewContactLinkInput
  isPrimary?: boolean
}

export type LeadServiceLinkInput = {
  serviceId: string
}

export type LeadStatusChangeInput = {
  status: LeadStatus
}

export type LeadActivity = {
  id: string
  type: string
  performedBy?: LeadOwner | null
  metadata?: Record<string, unknown>
  createdAt?: string
}

export type LeadNote = {
  id: string
  content: string
  visibility?: string
  createdBy?: LeadOwner | null
  createdAt?: string
}

export type LeadNoteInput = {
  resourceType: "LEAD"
  resourceId: string
  content: string
  visibility: "TEAM" | "PRIVATE"
}

export type LeadAttachment = {
  id: string
  fileName: string
  fileSize?: number
  mimeType?: string
  url?: string
  fileUrl?: string
  downloadUrl?: string
  uploadedBy?: LeadOwner | null
  createdAt?: string
}

export type LeadAttachmentInput = {
  resourceType: "LEAD"
  resourceId: string
  file: File
  fileName?: string
}

export type LeadPhoneDetail = ContactPhone
export type LeadEmailDetail = ContactEmail
