import { roles, type AdminRole } from "@/types/auth"
import {
  employeeStatuses,
  type Employee,
  type EmployeeStatus,
} from "@/types/employee"
import type {
  EmployeeInviteFormValues,
  EmployeeProfileFormValues,
} from "@/schemas/employee.schemas"
import { defaultPageSize, pageSizeOptions } from "@/components/users/users.constants"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatDisplayName } from "@/utils/display-format"

export const parsePage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseLimit = (value: string | null): (typeof pageSizeOptions)[number] => {
  const limit = Number(value)
  return pageSizeOptions.includes(limit as (typeof pageSizeOptions)[number])
    ? (limit as (typeof pageSizeOptions)[number])
    : defaultPageSize
}

export const parseStatus = (value: string | null): EmployeeStatus | "all" => {
  return employeeStatuses.includes(value as EmployeeStatus) ? (value as EmployeeStatus) : "all"
}

export const parseRole = (value: string | null): AdminRole | "all" => {
  return roles.includes(value as AdminRole) ? (value as AdminRole) : "all"
}

export const normalizeSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const getApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const getEmployeeName = (employee: Employee) => {
  return formatDisplayName(
    employee.displayName || `${employee.firstName} ${employee.lastName}`.trim() || "Unnamed employee"
  )
}

export const formatDate = (value?: string) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const employeeToInviteValues = (employee: Employee): EmployeeInviteFormValues => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  displayName: employee.displayName || `${employee.firstName} ${employee.lastName}`.trim(),
  email: employee.email,
  phone: employee.phone,
  role: employee.role,
})

export const employeeToProfileValues = (employee: Employee): EmployeeProfileFormValues => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  displayName: employee.displayName || `${employee.firstName} ${employee.lastName}`.trim(),
  email: employee.email,
  phone: employee.phone,
})
