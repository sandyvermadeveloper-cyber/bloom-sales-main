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
import type { Service } from "@/types/service"

type LeadsFiltersProps = {
  searchDraft: string
  status: LeadStatus | "all"
  priority: LeadPriority | "all"
  qualification: LeadQualification | "all"
  sourceId: string
  serviceId: string
  sources: LeadSource[]
  services: Service[]
  isLoadingOptions: boolean
  onSearchDraftChange: (value: string) => void
  onStatusChange: (value: LeadStatus | "all") => void
  onPriorityChange: (value: LeadPriority | "all") => void
  onQualificationChange: (value: LeadQualification | "all") => void
  onSourceChange: (value: string) => void
  onServiceChange: (value: string) => void
  onReset: () => void
}

export function LeadsFilters({
  searchDraft,
  status,
  priority,
  qualification,
  sourceId,
  serviceId,
  sources,
  services,
  isLoadingOptions,
  onSearchDraftChange,
  onStatusChange,
  onPriorityChange,
  onQualificationChange,
  onSourceChange,
  onServiceChange,
  onReset,
}: LeadsFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_150px_150px_170px] xl:grid-cols-[minmax(280px,1fr)_150px_150px_170px_170px_170px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Search by title, contact, email, phone..."
          aria-label="Search leads"
          className="pl-9"
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

      <Select value={sourceId} onValueChange={onSourceChange} disabled={isLoadingOptions}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.label || source.name || source.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={serviceId} onValueChange={onServiceChange} disabled={isLoadingOptions}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All services</SelectItem>
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.label || service.name || service.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" className="h-10" variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}
