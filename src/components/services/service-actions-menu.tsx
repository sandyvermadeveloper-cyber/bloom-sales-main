"use client"

import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Service } from "@/types/service"

type ServiceActionsMenuProps = {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onRestore: (service: Service) => void
}

export function ServiceActionsMenu({
  service,
  onEdit,
  onDelete,
  onRestore,
}: ServiceActionsMenuProps) {
  const isDeleted = Boolean(service.deletedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open service actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {!isDeleted ? (
          <DropdownMenuItem onSelect={() => onEdit(service)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        ) : null}

        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(service)}>
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onDelete(service)} className="text-destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
