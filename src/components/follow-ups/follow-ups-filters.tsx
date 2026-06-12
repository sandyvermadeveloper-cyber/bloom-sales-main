"use client"

import { RotateCcw, Search } from "lucide-react"

import {
  followUpStatusLabels,
  followUpStatuses,
} from "@/components/follow-ups/follow-ups.constants"
import { SearchableSelect } from "@/components/leads/lead-searchable-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Employee } from "@/types/employee"
import type { FollowUpStatus } from "@/types/follow-up"

type FollowUpsFiltersProps = {
  searchDraft: string
  status: FollowUpStatus | "all"
  assigneeId: string
  employees: Employee[]
  isLoadingEmployees: boolean
  onSearchDraftChange: (value: string) => void
  onStatusChange: (value: FollowUpStatus | "all") => void
  onAssigneeChange: (value: string) => void
  onReset: () => void
}

export function FollowUpsFilters({
  searchDraft,
  status,
  assigneeId,
  employees,
  isLoadingEmployees,
  onSearchDraftChange,
  onStatusChange,
  onAssigneeChange,
  onReset,
}: FollowUpsFiltersProps) {
  const assigneeOptions = [
    { value: "all", label: "All assignees" },
    ...employees.map((employee) => ({
      value: employee.id,
      label: employee.displayName || `${employee.firstName} ${employee.lastName}`.trim() || employee.email,
    })),
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
      <div className="relative col-span-2 md:col-span-2 lg:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Search by lead title or number"
          aria-label="Search follow-ups"
          className="h-10 pl-9"
        />
      </div>

      <div className="col-span-2 flex gap-3 md:col-span-4 lg:col-span-2">
        <div className="min-w-0 flex-1">
          <SearchableSelect
            value={assigneeId}
            options={assigneeOptions}
            placeholder={isLoadingEmployees ? "Loading assignees" : "All assignees"}
            searchPlaceholder="Search employees..."
            disabled={isLoadingEmployees}
            onChange={onAssigneeChange}
          />
        </div>

        <Button type="button" variant="outline" className="h-10 shrink-0" onClick={onReset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
