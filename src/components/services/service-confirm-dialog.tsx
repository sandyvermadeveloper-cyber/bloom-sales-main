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
import { getServiceName } from "@/components/services/services.utils"
import type { Service } from "@/types/service"

type ServiceConfirmDialogProps = {
  mode: "delete" | "restore"
  open: boolean
  service: Service | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ServiceConfirmDialog({
  mode,
  open,
  service,
  isPending,
  message,
  onOpenChange,
  onConfirm,
}: ServiceConfirmDialogProps) {
  const title = mode === "delete" ? "Delete service" : "Restore service"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? `This will delete ${service ? getServiceName(service) : "this service"}.`
              : `This will restore ${service ? getServiceName(service) : "this service"}.`}
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
