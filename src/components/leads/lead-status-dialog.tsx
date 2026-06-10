"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { leadStatuses, leadStatusLabels } from "@/components/leads/leads.constants"
import { getLeadTitle } from "@/components/leads/leads.utils"
import {
  leadStatusChangeSchema,
  type LeadStatusChangeFormValues,
} from "@/schemas/lead.schemas"
import type { Lead, LeadStatus } from "@/types/lead"
import { applyApiFieldErrors } from "@/utils/form-errors"

const statusFields = ["status"] as const

type LeadStatusDialogProps = {
  open: boolean
  lead: Lead | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadStatusChangeFormValues) => void
}

export function LeadStatusDialog({
  open,
  lead,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: LeadStatusDialogProps) {
  const form = useForm<LeadStatusChangeFormValues>({
    resolver: zodResolver(leadStatusChangeSchema),
    defaultValues: {
      status: "CONTACTED",
    },
  })

  useEffect(() => {
    if (!open) return
    const currentStatus = leadStatuses.includes(lead?.status as LeadStatus)
      ? (lead?.status as LeadStatus)
      : "CONTACTED"

    form.clearErrors()
    form.reset({ status: currentStatus })
  }, [form, lead, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, statusFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Change lead status</DialogTitle>
          <DialogDescription>
            Update status for {lead ? getLeadTitle(lead) : "this lead"}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl className="mt-2 w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {leadStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
