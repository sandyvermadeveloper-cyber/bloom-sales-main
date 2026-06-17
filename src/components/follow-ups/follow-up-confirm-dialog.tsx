"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"

import { getFollowUpLeadLabel } from "@/components/follow-ups/follow-ups.utils"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FollowUp } from "@/types/follow-up"

type FollowUpConfirmMode = "cancel" | "reopen" | "missed"

type FollowUpConfirmDialogProps = {
  mode: FollowUpConfirmMode
  open: boolean
  followUp: FollowUp | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: (reason?: string) => void
}

const modeCopy: Record<FollowUpConfirmMode, { title: string; description: string; confirmLabel: string; variant: "default" | "destructive" }> = {
  cancel: {
    title: "Cancel Follow-Up",
    description: "This will mark the follow-up as cancelled.",
    confirmLabel: "Cancel Follow-Up",
    variant: "destructive",
  },
  reopen: {
    title: "Reopen Follow-Up",
    description: "This will set the follow-up back to pending.",
    confirmLabel: "Reopen",
    variant: "default",
  },
  missed: {
    title: "Mark Follow-Up as Missed",
    description: "This will mark the follow-up as missed.",
    confirmLabel: "Mark Missed",
    variant: "destructive",
  },
}

export function FollowUpConfirmDialog({
  mode,
  open,
  followUp,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: FollowUpConfirmDialogProps) {
  const [reason, setReason] = useState("")
  const copy = modeCopy[mode]
  const showReason = mode === "cancel" || mode === "reopen"

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setReason("")
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {followUp ? `${copy.description} (${getFollowUpLeadLabel(followUp)})` : copy.description}
          </DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        {showReason ? (
          <div>
            <Label htmlFor="follow-up-confirm-reason">Reason</Label>
            <Textarea
              id="follow-up-confirm-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Add a reason"
              rows={3}
              disabled={isPending}
              className="mt-2"
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={copy.variant}
            disabled={isPending}
            onClick={() => {
              onConfirm(showReason ? reason.trim() || undefined : undefined)
              if (!showReason) setReason("")
            }}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
