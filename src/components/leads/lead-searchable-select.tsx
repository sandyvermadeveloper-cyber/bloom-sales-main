"use client"

import { Check, ChevronDown, Search, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchOption = {
  value: string
  label: string
}

type SearchableSelectProps = {
  value: string
  options: SearchOption[]
  placeholder: string
  searchPlaceholder: string
  disabled?: boolean
  onChange: (value: string) => void
}

type SearchableMultiSelectProps = {
  value: string[]
  options: SearchOption[]
  placeholder: string
  searchPlaceholder: string
  disabled?: boolean
  onChange: (value: string[]) => void
}

export function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  onChange,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("")
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useFilteredOptions(options, search)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-10 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => onChange(option.value)}>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.value === value ? <Check className="size-4" /> : null}
              </DropdownMenuItem>
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No options found.</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SearchableMultiSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  onChange,
}: SearchableMultiSelectProps) {
  const [search, setSearch] = useState("")
  const filteredOptions = useFilteredOptions(options, search)
  const selectedOptions = options.filter((option) => value.includes(option.value))

  const toggleOption = (optionValue: string, checked: boolean) => {
    onChange(
      checked
        ? [...value, optionValue]
        : value.filter((selectedValue) => selectedValue !== optionValue)
    )
  }

  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-10 w-full justify-between font-normal"
          >
            <span className={cn("truncate", selectedOptions.length === 0 && "text-muted-foreground")}>
              {selectedOptions.length ? `${selectedOptions.length} selected` : placeholder}
            </span>
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder={searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) => toggleOption(option.value, Boolean(checked))}
                  onSelect={(event) => event.preventDefault()}
                >
                  <span className="truncate">{option.label}</span>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No options found.</p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1.5">
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                disabled={disabled}
                onClick={() => toggleOption(option.value, false)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const useFilteredOptions = (options: SearchOption[], search: string) => {
  return useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options

    return options.filter((option) => option.label.toLowerCase().includes(query))
  }, [options, search])
}
