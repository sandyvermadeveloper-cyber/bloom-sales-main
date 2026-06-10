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
    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Search lead sources"
        aria-label="Search lead sources"
      />

      <Button type="button" className="h-10" variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}
