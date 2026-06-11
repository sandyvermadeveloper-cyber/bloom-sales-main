"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ServicesFiltersProps = {
  searchDraft: string
  onSearchDraftChange: (value: string) => void
  onReset: () => void
}

export function ServicesFilters({
  searchDraft,
  onSearchDraftChange,
  onReset,
}: ServicesFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Search services"
        aria-label="Search services"
        className="h-10 flex-1"
      />

      <Button type="button" className="h-10 px-3 shrink-0" variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" />
        <span className="hidden sm:inline">Reset</span>
      </Button>
    </div>
  )
}
