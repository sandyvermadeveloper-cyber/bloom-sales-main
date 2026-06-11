"use client"

import { Loader2 } from "lucide-react"

import { getCustomerName } from "@/components/customers/customers.utils"
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
import type { Customer } from "@/types/customer"

type CustomerConfirmDialogProps = {
  mode: "delete" | "restore"
  open: boolean
  customer: Customer | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CustomerConfirmDialog({
  mode,
  open,
  customer,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: CustomerConfirmDialogProps) {
  const title = mode === "delete" ? "Delete customer" : "Restore customer"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? `This will delete ${customer ? getCustomerName(customer) : "this customer"}.`
              : `This will restore ${customer ? getCustomerName(customer) : "this customer"}.`}
          </DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={mode === "delete" ? "destructive" : "default"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "delete" ? "Delete" : "Restore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
