export type FollowUpType = "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SITE_VISIT" | "OTHER"

export type FollowUpStatus = "PENDING" | "COMPLETED" | "MISSED" | "CANCELLED"

export type FollowUpOutcome =
  | "INTERESTED"
  | "CALL_BACK_LATER"
  | "MEETING_SCHEDULED"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "NOT_INTERESTED"
  | "NO_RESPONSE"
  | "WRONG_NUMBER"

export type FollowUpView = "inbox" | "upcoming" | "completed" | "all"

export type FollowUpSortBy = "scheduledAt" | "status" | "createdAt" | "updatedAt"

export type FollowUpSortOrder = "asc" | "desc"

export type FollowUpOwner = {
  id: string
  name: string
}

export type FollowUpLead = {
  id: string
  leadNumber?: string
  label?: string
  title?: string
  priority?: string
  status?: string
  qualification?: string
  expectedClosingDate?: string | null
}

export type FollowUpContact = {
  id: string
  fullName?: string
  designation?: string | null
  primaryPhone?: string | null
  primaryEmail?: string | null
}

export type FollowUp = {
  id: string
  followUpNumber?: string
  lead?: FollowUpLead | null
  type: FollowUpType | string
  customType?: string | null
  status: FollowUpStatus | string
  scheduledAt: string
  completedAt?: string | null
  outcome?: FollowUpOutcome | string | null
  assignedTo?: FollowUpOwner | null
  createdBy?: FollowUpOwner | null
  completedBy?: FollowUpOwner | null
  createdAt?: string
  updatedAt?: string
  primaryContact?: FollowUpContact | null
  companyName?: string | null
  notes?: string | null
  isOverdue?: boolean
  overdueMinutes?: number | null
}

export type FollowUpData = FollowUp

export type CreateFollowUpInput = {
  leadId: string
  type: FollowUpType
  customType?: string
  scheduledAt: string
  notes?: string
  assignedToEmployeeId?: string
}

export type UpdateFollowUpInput = Partial<
  Pick<CreateFollowUpInput, "type" | "customType" | "scheduledAt" | "notes" | "assignedToEmployeeId">
>

export type AssignFollowUpInput = {
  employeeId: string
  reason?: string
}

export type CompleteFollowUpInput = {
  outcome: FollowUpOutcome
  notes?: string
}

export type RescheduleFollowUpInput = {
  scheduledAt: string
  reason?: string
}

export type CancelFollowUpInput = {
  reason?: string
}

export type ReopenFollowUpInput = {
  reason?: string
}

export type ListFollowUpsQuery = {
  page: number
  limit: number
  leadId?: string
  status?: FollowUpStatus
  assignedToEmployeeId?: string
  search?: string
  scheduledFrom?: string
  scheduledTo?: string
  sortBy?: FollowUpSortBy
  sortOrder?: FollowUpSortOrder
  view?: FollowUpView
  timezoneOffset?: number
}

export type FollowUpsPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListFollowUpsData = {
  followUps: FollowUp[]
  pagination: FollowUpsPagination
}

export type FollowUpStats = {
  inboxCount: number
  overdueCount: number
  upcomingCount: number
  completedTodayCount: number
}
