"use client"

import { CircleDot, Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Lead } from "@/types/lead"

type LeadActionsMenuProps = {
  lead: Lead
  onEdit: (lead: Lead) => void
  onView: (lead: Lead) => void
  onChangeStatus: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onRestore: (lead: Lead) => void
}

export function LeadActionsMenu({
  lead,
  onEdit,
  onView,
  onChangeStatus,
  onDelete,
  onRestore,
}: LeadActionsMenuProps) {
  const isDeleted = Boolean(lead.deletedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open lead actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => onView(lead)}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>

        {!isDeleted ? (
          <>
            <DropdownMenuItem onSelect={() => onEdit(lead)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onChangeStatus(lead)}>
              <CircleDot className="size-4" />
              Change status
            </DropdownMenuItem>
          </>
        ) : null}

        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(lead)}>
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onDelete(lead)} className="text-destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
