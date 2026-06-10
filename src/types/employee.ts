import type { AdminRole } from "@/types/auth"

export const employeeStatuses = ["invited", "active", "suspended", "archived"] as const

export type EmployeeStatus = (typeof employeeStatuses)[number]

export type EmployeeInviteInput = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  role: AdminRole
}

export type EmployeeProfileUpdateInput = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
}

export type EmployeeRoleUpdateInput = {
  role: AdminRole
}

export type EmployeeMutableStatus = Exclude<EmployeeStatus, "invited">

export type EmployeeStatusUpdateInput = {
  status: EmployeeMutableStatus
}

export type Employee = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  displayName: string | null
  email: string
  phone: string
  role: AdminRole
  status: EmployeeStatus
  createdAt?: string
  updatedAt?: string
}

export type InvitedEmployee = Employee

export type EmployeeInviteData = {
  employee: InvitedEmployee
  inviteToken: string
}

export type EmployeeData = {
  employee: Employee
}

export type ListEmployeesQuery = {
  page: number
  limit: number
  search?: string
  status?: EmployeeStatus
  role?: AdminRole
}

export type EmployeesPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListEmployeesData = {
  employees: Employee[]
  pagination: EmployeesPagination
}
