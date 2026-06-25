export const defaultFollowUpPageSize = 20

export const followUpPageSizeOptions = [20, 50, 100] as const

export const followUpTypes = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT", "OTHER"] as const

export const followUpStatuses = ["PENDING", "COMPLETED", "MISSED", "CANCELLED"] as const

export const followUpOutcomes = [
  "INTERESTED",
  "CALL_BACK_LATER",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "CONVERTED",
  "NOT_INTERESTED",
  "NO_RESPONSE",
  "WRONG_NUMBER",
] as const

export const followUpViews = ["inbox", "upcoming", "completed", "all"] as const

export const followUpFields = [
  "leadId",
  "type",
  "customType",
  "scheduledAt",
  "notes",
  "assignedToEmployeeId",
] as const

export const followUpViewLabels: Record<string, string> = {
  inbox: "Inbox",
  upcoming: "Upcoming",
  completed: "Completed",
  all: "All",
}

export const followUpTypeLabels: Record<string, string> = {
  CALL: "Call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  MEETING: "Meeting",
  SITE_VISIT: "Site Visit",
  OTHER: "Other",
}

export const followUpStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
}

export const followUpOutcomeLabels: Record<string, string> = {
  INTERESTED: "Interested",
  CALL_BACK_LATER: "Call Back Later",
  MEETING_SCHEDULED: "Meeting Scheduled",
  PROPOSAL_SENT: "Proposal Sent",
  CONVERTED: "Converted",
  NOT_INTERESTED: "Not Interested",
  NO_RESPONSE: "No Response",
  WRONG_NUMBER: "Wrong Number",
}

export const followUpStatusBadgeClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  COMPLETED: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  MISSED: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
}

export const followUpTypeBadgeClasses: Record<string, string> = {
  CALL: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  WHATSAPP: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  EMAIL: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
  MEETING: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  SITE_VISIT: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  OTHER: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
}

export const followUpOutcomeBadgeClasses: Record<string, string> = {
  INTERESTED: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  CALL_BACK_LATER: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  MEETING_SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  PROPOSAL_SENT: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  CONVERTED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  NOT_INTERESTED: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  NO_RESPONSE: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  WRONG_NUMBER: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}
