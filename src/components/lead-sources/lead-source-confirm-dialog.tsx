"use client"

import { Loader2 } from "lucide-react"

import { getLeadSourceName } from "@/components/lead-sources/lead-sources.utils"
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
import type { LeadSource } from "@/types/lead-source"

type LeadSourceConfirmDialogProps = {
  mode: "delete" | "restore"
  open: boolean
  leadSource: LeadSource | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LeadSourceConfirmDialog({
  mode,
  open,
  leadSource,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: LeadSourceConfirmDialogProps) {
  const title = mode === "delete" ? "Delete lead source" : "Restore lead source"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? `This will delete ${leadSource ? getLeadSourceName(leadSource) : "this lead source"}.`
              : `This will restore ${leadSource ? getLeadSourceName(leadSource) : "this lead source"}.`}
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
