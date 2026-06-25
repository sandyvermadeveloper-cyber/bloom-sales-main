"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarClock, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { getFollowUpLeadLabel, toDateTimeInputValue } from "@/components/crm/follow-ups/follow-ups.utils"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  followUpRescheduleSchema,
  type FollowUpRescheduleFormValues,
} from "@/schemas/follow-up.schemas"
import type { FollowUp } from "@/types/follow-up"
import { applyApiFieldErrors } from "@/utils/form-errors"

const rescheduleFields = ["scheduledAt", "reason"] as const

type FollowUpRescheduleDialogProps = {
  open: boolean
  followUp: FollowUp | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FollowUpRescheduleFormValues) => void
}

export function FollowUpRescheduleDialog({
  open,
  followUp,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: FollowUpRescheduleDialogProps) {
  const form = useForm<FollowUpRescheduleFormValues>({
    resolver: zodResolver(followUpRescheduleSchema),
    defaultValues: { scheduledAt: "", reason: "" },
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({ scheduledAt: toDateTimeInputValue(followUp?.scheduledAt), reason: "" })
  }, [followUp, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, rescheduleFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Follow-Up</DialogTitle>
          <DialogDescription>
            {followUp
              ? `Choose a new date and time for ${getFollowUpLeadLabel(followUp)}.`
              : "Choose a new date and time for this follow-up."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled At</FormLabel>
                  <FormControl className="mt-2">
                    <Input type="datetime-local" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Add a reason for rescheduling" rows={3} disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
                Reschedule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
