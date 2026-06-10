import type { EmployeeMutableStatus } from "@/types/employee"

export const inviteFields = ["firstName", "lastName", "displayName", "email", "phone", "role"] as const

export const profileFields = ["firstName", "lastName", "displayName", "email", "phone"] as const

export const defaultPageSize = 20

export const pageSizeOptions = [20, 50, 100] as const

export const mutableStatuses = ["active", "suspended", "archived"] as const satisfies readonly EmployeeMutableStatus[]
