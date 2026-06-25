"use client"

import { Loader2 } from "lucide-react"

import { getLeadTitle } from "@/components/crm/leads/leads.utils"
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
import type { Lead } from "@/types/lead"

type LeadConfirmDialogProps = {
  mode: "delete" | "restore"
  open: boolean
  lead: Lead | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LeadConfirmDialog({
  mode,
  open,
  lead,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: LeadConfirmDialogProps) {
  const title = mode === "delete" ? "Delete lead" : "Restore lead"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? `This will delete ${lead ? getLeadTitle(lead) : "this lead"}.`
              : `This will restore ${lead ? getLeadTitle(lead) : "this lead"}.`}
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
