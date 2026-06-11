"use client"

import { CircleDot, Eye, MoreHorizontal, Pencil, RotateCcw, Trash2, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Customer } from "@/types/customer"

type CustomerActionsMenuProps = {
  customer: Customer
  onEdit: (customer: Customer) => void
  onView: (customer: Customer) => void
  onAssign: (customer: Customer) => void
  onChangeStatus: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onRestore: (customer: Customer) => void
}

export function CustomerActionsMenu({
  customer,
  onEdit,
  onView,
  onAssign,
  onChangeStatus,
  onDelete,
  onRestore,
}: CustomerActionsMenuProps) {
  const isDeleted = Boolean(customer.deletedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open customer actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onView(customer)}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>

        {!isDeleted ? (
          <>
            <DropdownMenuItem onSelect={() => onEdit(customer)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAssign(customer)}>
              <UserCog className="size-4" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onChangeStatus(customer)}>
              <CircleDot className="size-4" />
              Change status
            </DropdownMenuItem>
          </>
        ) : null}

        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(customer)}>
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onDelete(customer)} className="text-destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
