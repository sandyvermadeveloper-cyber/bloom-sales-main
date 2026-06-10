"use client"

import { MoreHorizontal, Pencil, RefreshCw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminProfile } from "@/types/auth"
import type { Employee } from "@/types/employee"

type EmployeeActionsMenuProps = {
  employee: Employee
  currentEmployee: AdminProfile | null
  onEditProfile: (employee: Employee) => void
  onResendInvite: (employee: Employee) => void
  onChangeRole: (employee: Employee) => void
  onChangeStatus: (employee: Employee) => void
}

export function EmployeeActionsMenu({
  employee,
  currentEmployee,
  onEditProfile,
  onResendInvite,
  onChangeRole,
  onChangeStatus,
}: EmployeeActionsMenuProps) {
  const isOwnRow = currentEmployee?.id === employee.id
  const canManageAccess = currentEmployee?.role === "admin" && !isOwnRow
  const canEditProfile = employee.status === "active" || employee.status === "suspended"
  const canResendInvite = employee.status === "invited"
  const canChangeStatus = canManageAccess && employee.status !== "invited"
  const hasActions = canEditProfile || canResendInvite || canManageAccess || canChangeStatus

  if (!hasActions) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open employee actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canEditProfile ? (
          <DropdownMenuItem onSelect={() => onEditProfile(employee)}>
            <Pencil className="size-4" />
            Edit profile
          </DropdownMenuItem>
        ) : null}

        {canResendInvite ? (
          <DropdownMenuItem onSelect={() => onResendInvite(employee)}>
            <RefreshCw className="size-4" />
            Resend invite
          </DropdownMenuItem>
        ) : null}

        {(canEditProfile || canResendInvite) && (canManageAccess || canChangeStatus) ? (
          <DropdownMenuSeparator />
        ) : null}

        {canManageAccess ? (
          <DropdownMenuItem onSelect={() => onChangeRole(employee)}>
            <ShieldCheck className="size-4" />
            Change role
          </DropdownMenuItem>
        ) : null}

        {canChangeStatus ? (
          <DropdownMenuItem onSelect={() => onChangeStatus(employee)}>
            <ShieldCheck className="size-4" />
            Change status
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
