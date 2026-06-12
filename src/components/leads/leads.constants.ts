export const defaultLeadPageSize = 20

export const leadPageSizeOptions = [20, 50, 100] as const

export const leadPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

export const leadQualifications = ["COLD", "WARM", "HOT"] as const

export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "LOST",
] as const

export const leadFields = [
  "title",
  "sourceId",
  "serviceIds",
  "summary",
  "budgetMin",
  "budgetMax",
  "priority",
  "qualification",
  "expectedClosingDate",
  "existingContactIds",
  "newContacts",
] as const

export const contactLabels = ["WORK", "PERSONAL"] as const

export const leadUpdateFields = [
  "title",
  "sourceId",
  "summary",
  "budgetMin",
  "budgetMax",
  "priority",
  "qualification",
  "expectedClosingDate",
] as const

export const leadPriorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
}

export const leadQualificationLabels: Record<string, string> = {
  COLD: "Cold",
  WARM: "Warm",
  HOT: "Hot",
}

export const leadStatusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
}

export const leadPriorityBadgeClasses: Record<string, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  MEDIUM: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  HIGH: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  URGENT: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

export const leadQualificationBadgeClasses: Record<string, string> = {
  COLD: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300",
  WARM: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  HOT: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

export const leadStatusBadgeClasses: Record<string, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  CONTACTED: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
  NEGOTIATION: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  QUALIFIED: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  PROPOSAL_SENT: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  WON: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  LOST: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
}
