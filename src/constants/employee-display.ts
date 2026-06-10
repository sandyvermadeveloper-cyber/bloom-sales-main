import type { AdminRole } from "@/types/auth"
import type { EmployeeStatus } from "@/types/employee"

export const roleLabels: Record<AdminRole, string> = {
  admin: "Admin",
  manager: "Manager",
  sales: "Sales",
  support: "Support",
  telecaller: "Telecaller",
}

export const statusLabels: Record<EmployeeStatus, string> = {
  invited: "Invited",
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
}

export const roleBadgeClasses: Record<AdminRole, string> = {
  admin: "border-destructive/20 bg-destructive/10 text-destructive",
  manager: "border-warning/20 bg-warning/10 text-warning",
  sales: "border-success/20 bg-success/10 text-success",
  support: "border-info/20 bg-info/10 text-info",
  telecaller: "border-primary/20 bg-primary/10 text-primary",
}

export const statusBadgeClasses: Record<EmployeeStatus, string> = {
  invited: "border-warning/20 bg-warning/10 text-warning",
  active: "border-success/20 bg-success/10 text-success",
  suspended: "border-destructive/20 bg-destructive/10 text-destructive",
  archived: "border-info/20 bg-info/10 text-info",
}

const fallbackBadgeClasses = "border-border bg-muted text-muted-foreground"

const toDisplayText = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const normalizeRole = (role: string | null | undefined) => {
  const normalizedRole = role?.toLowerCase() as AdminRole | undefined

  return normalizedRole && normalizedRole in roleLabels ? normalizedRole : null
}

export const normalizeStatus = (status: string | null | undefined) => {
  const normalizedStatus = status?.toLowerCase() as EmployeeStatus | undefined

  return normalizedStatus && normalizedStatus in statusLabels ? normalizedStatus : null
}

export const getRoleLabel = (role: string | null | undefined) => {
  const normalizedRole = normalizeRole(role)

  return normalizedRole ? roleLabels[normalizedRole] : toDisplayText(role ?? "Unknown")
}

export const getStatusLabel = (status: string | null | undefined) => {
  const normalizedStatus = normalizeStatus(status)

  return normalizedStatus ? statusLabels[normalizedStatus] : toDisplayText(status ?? "Unknown")
}

export const getRoleBadgeClasses = (role: string | null | undefined) => {
  const normalizedRole = normalizeRole(role)

  return normalizedRole ? roleBadgeClasses[normalizedRole] : fallbackBadgeClasses
}

export const getStatusBadgeClasses = (status: string | null | undefined) => {
  const normalizedStatus = normalizeStatus(status)

  return normalizedStatus ? statusBadgeClasses[normalizedStatus] : fallbackBadgeClasses
}
