import type { ContactEmail, ContactLabel, ContactPhone } from "@/types/contact"

export type CustomerType = "BUSINESS" | "INDIVIDUAL"

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED"

export type CustomerOwner = {
  id: string
  name: string
}

export type CustomerContact = {
  id: string
  fullName?: string
  designation?: string | null
  primaryPhone?: string | null
  primaryEmail?: string | null
  isPrimary?: boolean
}

export type Customer = {
  id: string
  customerNumber?: string
  name: string
  customerType?: CustomerType | string
  status?: CustomerStatus | string
  owner?: CustomerOwner | null
  primaryContact?: CustomerContact | null
  contacts?: CustomerContact[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type CustomerPhoneInput = {
  phone: string
  label: ContactLabel
}

export type CustomerEmailInput = {
  email: string
  label: ContactLabel
}

export type CustomerNewContactInput = {
  firstName: string
  lastName: string
  designation?: string
  phones: CustomerPhoneInput[]
  emails: CustomerEmailInput[]
}

export type CreateCustomerInput = {
  name: string
  customerType: CustomerType
  ownerEmployeeId?: string
  newContacts?: CustomerNewContactInput[]
}

export type UpdateCustomerInput = Partial<{
  name: string
  customerType: CustomerType
}>

export type ListCustomersQuery = {
  page: number
  limit: number
  search?: string
  status?: CustomerStatus
}

export type CustomersPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListCustomersData = {
  customers: Customer[]
  pagination: CustomersPagination
}

export type CustomerData = Customer

export type CustomerNewContactLinkInput = {
  firstName: string
  lastName?: string
  designation?: string
  phones: CustomerPhoneInput[]
  emails?: CustomerEmailInput[]
}

export type CustomerContactLinkInput = {
  contactId?: string
  newContact?: CustomerNewContactLinkInput
  isPrimary?: boolean
}

export type CustomerAssignInput = {
  employeeId: string
  reason: string
}

export type CustomerStatusChangeInput = {
  status: CustomerStatus
}

export type CustomerAssignment = {
  id: string
  reason?: string
  employee?: CustomerOwner | null
  assignedBy?: CustomerOwner | null
  createdAt?: string
}

export type CustomerActivity = {
  id: string
  type: string
  performedBy?: CustomerOwner | null
  metadata?: Record<string, unknown>
  createdAt?: string
}

export type CustomerNote = {
  id: string
  content: string
  visibility?: string
  createdBy?: CustomerOwner | null
  createdAt?: string
}

export type CustomerNoteInput = {
  resourceType: "CUSTOMER"
  resourceId: string
  content: string
  visibility: "TEAM" | "PRIVATE"
}

export type CustomerAttachment = {
  id: string
  fileName: string
  fileSize?: number
  mimeType?: string
  url?: string
  fileUrl?: string
  downloadUrl?: string
  uploadedBy?: CustomerOwner | null
  createdAt?: string
}

export type CustomerAttachmentInput = {
  resourceType: "CUSTOMER"
  resourceId: string
  file: File
  fileName?: string
}

export type CustomerPhoneDetail = ContactPhone
export type CustomerEmailDetail = ContactEmail
