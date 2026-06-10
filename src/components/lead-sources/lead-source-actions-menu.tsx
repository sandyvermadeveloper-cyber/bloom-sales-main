"use client"

import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LeadSource } from "@/types/lead-source"

type LeadSourceActionsMenuProps = {
  leadSource: LeadSource
  onEdit: (leadSource: LeadSource) => void
  onDelete: (leadSource: LeadSource) => void
  onRestore: (leadSource: LeadSource) => void
}

export function LeadSourceActionsMenu({
  leadSource,
  onEdit,
  onDelete,
  onRestore,
}: LeadSourceActionsMenuProps) {
  const isDeleted = Boolean(leadSource.deletedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open lead source actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {!isDeleted ? (
          <DropdownMenuItem onSelect={() => onEdit(leadSource)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        ) : null}

        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(leadSource)}>
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onDelete(leadSource)} className="text-destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
