"use client"

import { Eye, MailPlus, MoreHorizontal, Pencil, PhoneCall, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Contact } from "@/types/contact"

type ContactActionsMenuProps = {
  contact: Contact
  onView: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onAddPhone: (contact: Contact) => void
  onAddEmail: (contact: Contact) => void
  onDelete: (contact: Contact) => void
  onRestore: (contact: Contact) => void
}

export function ContactActionsMenu({
  contact,
  onView,
  onEdit,
  onAddPhone,
  onAddEmail,
  onDelete,
  onRestore,
}: ContactActionsMenuProps) {
  const isDeleted = Boolean(contact.deletedAt)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open contact actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => onView(contact)}>
          <Eye className="size-4" />
          View details
        </DropdownMenuItem>

        {!isDeleted ? (
          <>
            <DropdownMenuItem onSelect={() => onEdit(contact)}>
              <Pencil className="size-4" />
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddPhone(contact)}>
              <PhoneCall className="size-4" />
              Add phone
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddEmail(contact)}>
              <MailPlus className="size-4" />
              Add email
            </DropdownMenuItem>
          </>
        ) : null}

        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(contact)}>
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onDelete(contact)} className="text-destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
