"use client"

import { Loader2 } from "lucide-react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getContactName } from "@/components/crm/contacts/contacts.utils"
import type { Contact, ContactEmail, ContactPhone } from "@/types/contact"
import { formatEmail, formatPhoneNumber } from "@/utils/display-format"

type ContactConfirmTarget =
  | { type: "contact"; mode: "delete" | "restore"; contact: Contact }
  | { type: "phone"; contact: Contact; phone: ContactPhone }
  | { type: "email"; contact: Contact; email: ContactEmail }

type ContactConfirmDialogProps = {
  target: ContactConfirmTarget | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ContactConfirmDialog({
  target,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: ContactConfirmDialogProps) {
  const isOpen = Boolean(target)
  const isDestructive = target?.type !== "contact" || target.mode === "delete"
  const title = getTitle(target)
  const description = getDescription(target)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {target?.type === "contact" && target.mode === "restore" ? "Restore" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const getTitle = (target: ContactConfirmTarget | null) => {
  if (!target) return "Confirm action"
  if (target.type === "phone") return "Delete phone"
  if (target.type === "email") return "Delete email"
  return target.mode === "delete" ? "Delete contact" : "Restore contact"
}

const getDescription = (target: ContactConfirmTarget | null) => {
  if (!target) return "Please confirm this action."
  if (target.type === "phone") return `This will delete ${formatPhoneNumber(target.phone.phone)}.`
  if (target.type === "email") return `This will delete ${formatEmail(target.email.email)}.`

  return target.mode === "delete"
    ? `This will delete ${getContactName(target.contact)}.`
    : `This will restore ${getContactName(target.contact)}.`
}

export type { ContactConfirmTarget }
