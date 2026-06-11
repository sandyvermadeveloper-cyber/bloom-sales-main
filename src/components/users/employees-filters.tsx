"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roleLabels, statusLabels } from "@/constants/employee-display"
import { roles, type AdminRole } from "@/types/auth"
import { employeeStatuses, type EmployeeStatus } from "@/types/employee"

type EmployeesFiltersProps = {
  searchDraft: string
  status: EmployeeStatus | "all"
  role: AdminRole | "all"
  onSearchDraftChange: (value: string) => void
  onStatusChange: (value: EmployeeStatus | "all") => void
  onRoleChange: (value: AdminRole | "all") => void
  onReset: () => void
}

export function EmployeesFilters({
  searchDraft,
  status,
  role,
  onSearchDraftChange,
  onStatusChange,
  onRoleChange,
  onReset,
}: EmployeesFiltersProps) {
  return (
    <div className=" grid gap-3
    grid-cols-2
    md:grid-cols-[minmax(250px,1fr)_160px_160px_auto]">
      <div className="col-span-2 md:col-span-1">
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Search employees"
          aria-label="Search employees"
          className="h-10 "
        />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as EmployeeStatus | "all")}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {employeeStatuses.map((employeeStatus) => (
            <SelectItem key={employeeStatus} value={employeeStatus}>
              {statusLabels[employeeStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={(value) => onRoleChange(value as AdminRole | "all")}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {roles.map((employeeRole) => (
            <SelectItem key={employeeRole} value={employeeRole}>
              {roleLabels[employeeRole]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="col-span-2 h-10 w-full md:col-span-1 md:w-auto"
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}
