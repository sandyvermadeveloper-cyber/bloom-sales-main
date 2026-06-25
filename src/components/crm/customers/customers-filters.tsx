"use client"

import { RotateCcw, Search } from "lucide-react"

import { customerStatusLabels, customerStatuses } from "@/components/crm/customers/customers.constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CustomerStatus } from "@/types/customer"

type CustomersFiltersProps = {
  searchDraft: string
  status: CustomerStatus | "all"
  onSearchDraftChange: (value: string) => void
  onStatusChange: (value: CustomerStatus | "all") => void
  onReset: () => void
}

export function CustomersFilters({
  searchDraft,
  status,
  onSearchDraftChange,
  onStatusChange,
  onReset,
}: CustomersFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_auto]">
      <div className="relative col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchDraft}
          onChange={(event) => onSearchDraftChange(event.target.value)}
          placeholder="Search by name, contact, email, phone..."
          aria-label="Search customers"
          className="h-10 pl-9"
        />
      </div>

      <Select value={status} onValueChange={(value) => onStatusChange(value as CustomerStatus | "all")}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {customerStatuses.map((customerStatus) => (
            <SelectItem key={customerStatus} value={customerStatus}>
              {customerStatusLabels[customerStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" className="h-10 w-full lg:w-auto" variant="outline" onClick={onReset}>
        <RotateCcw className="size-4" />
        Reset
      </Button>
    </div>
  )
}
