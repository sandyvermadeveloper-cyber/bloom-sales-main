"use client"

import { RotateCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/leads/lead-searchable-select"
import {
  leadPriorities,
  leadPriorityLabels,
  leadQualifications,
  leadQualificationLabels,
  leadStatuses,
  leadStatusLabels,
} from "@/components/leads/leads.constants"
import type { LeadPriority, LeadQualification, LeadStatus } from "@/types/lead"
import type { LeadSource } from "@/types/lead-source"

type LeadsFiltersProps = {
  searchDraft: string
  status: LeadStatus | "all"
  priority: LeadPriority | "all"
  qualification: LeadQualification | "all"
  sourceId: string
  sources: LeadSource[]
  isLoadingOptions: boolean
  onSearchDraftChange: (value: string) => void
  onStatusChange: (value: LeadStatus | "all") => void
  onPriorityChange: (value: LeadPriority | "all") => void
  onQualificationChange: (value: LeadQualification | "all") => void
  onSourceChange: (value: string) => void
  onSourceSearchChange: (value: string) => void
  onReset: () => void
}

export function LeadsFilters({
  searchDraft,
  status,
  priority,
  qualification,
  sourceId,
  sources,
  isLoadingOptions,
  onSearchDraftChange,
  onStatusChange,
  onPriorityChange,
  onQualificationChange,
  onSourceChange,
  onSourceSearchChange,
  onReset,
}: LeadsFiltersProps) {
  const sourceOptions = [
    { value: "all", label: "All sources" },
    ...sources.map((source) => ({
      value: source.id,
      label: source.label || source.name || source.id,
    })),
  ]

  return (
    <div
      className="
         grid grid-cols-2 gap-3
    md:grid-cols-5
      "
    >
      <div className="relative col-span-2 md:col-span-5 ">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Search by Lead-Id, Title"
          aria-label="Search leads"
          className="h-10 pl-9"
        />
      </div>

{/* Mobile me full row, Tablet/Desktop me normal */}
  <div className="col-span-2 md:col-span-1">
       <SearchableSelect
        value={sourceId}
        options={sourceOptions}
        placeholder="All sources"
        searchPlaceholder="Lead sources..."
        disabled={isLoadingOptions}
        onSearchChange={onSourceSearchChange}
        onChange={onSourceChange}
      />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as LeadStatus | "all")}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {leadStatuses.map((leadStatus) => (
            <SelectItem key={leadStatus} value={leadStatus}>
              {leadStatusLabels[leadStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(value) => onPriorityChange(value as LeadPriority | "all")}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {leadPriorities.map((leadPriority) => (
            <SelectItem key={leadPriority} value={leadPriority}>
              {leadPriorityLabels[leadPriority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={qualification}
        onValueChange={(value) => onQualificationChange(value as LeadQualification | "all")}
      >
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Qualification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All qualifications</SelectItem>
          {leadQualifications.map((leadQualification) => (
            <SelectItem key={leadQualification} value={leadQualification}>
              {leadQualificationLabels[leadQualification]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

     

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        onClick={onReset}
      >
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}
