"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LeadSourcesFiltersProps = {
  searchDraft: string
  onSearchDraftChange: (value: string) => void
  onReset: () => void
}

export function LeadSourcesFilters({
  searchDraft,
  onSearchDraftChange,
  onReset,
}: LeadSourcesFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Search lead sources"
        aria-label="Search lead sources"
        className="h-10"
      />

      <Button type="button" className="h-10 px-3 shrink-0" variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" />
        <span className="hidden sm:inline">Reset</span>
      </Button>
    </div>
  )
}
