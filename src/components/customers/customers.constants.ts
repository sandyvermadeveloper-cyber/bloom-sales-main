export const defaultCustomerPageSize = 20

export const customerPageSizeOptions = [20, 50, 100] as const

export const customerTypes = ["BUSINESS", "INDIVIDUAL"] as const

export const customerStatuses = ["ACTIVE", "INACTIVE", "BLOCKED"] as const

export const contactLabels = ["WORK", "PERSONAL"] as const

export const customerFields = [
  "name",
  "customerType",
  "ownerEmployeeId",
  "existingContactIds",
  "newContacts",
] as const

export const customerUpdateFields = ["name", "customerType"] as const

export const customerTypeLabels: Record<string, string> = {
  BUSINESS: "Business",
  INDIVIDUAL: "Individual",
}

export const customerStatusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
}

export const customerTypeBadgeClasses: Record<string, string> = {
  BUSINESS: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
  INDIVIDUAL: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
}

export const customerStatusBadgeClasses: Record<string, string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  INACTIVE: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  BLOCKED: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}
