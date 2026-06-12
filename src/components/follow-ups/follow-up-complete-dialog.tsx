"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  followUpOutcomeLabels,
  followUpOutcomes,
} from "@/components/follow-ups/follow-ups.constants"
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
import { Textarea } from "@/components/ui/textarea"
import {
  followUpCompleteSchema,
  type FollowUpCompleteFormValues,
} from "@/schemas/follow-up.schemas"
import type { FollowUp } from "@/types/follow-up"
import { applyApiFieldErrors } from "@/utils/form-errors"

const completeFields = ["outcome", "notes"] as const

type FollowUpCompleteDialogProps = {
  open: boolean
  followUp: FollowUp | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FollowUpCompleteFormValues) => void
}

export function FollowUpCompleteDialog({
  open,
  followUp,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: FollowUpCompleteDialogProps) {
  const form = useForm<FollowUpCompleteFormValues>({
    resolver: zodResolver(followUpCompleteSchema),
    defaultValues: { outcome: "INTERESTED", notes: "" },
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({ outcome: "INTERESTED", notes: "" })
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, completeFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Follow-Up Complete</DialogTitle>
          <DialogDescription>
            {followUp
              ? `Record the outcome for ${getFollowUpLeadLabel(followUp)}.`
              : "Record the outcome for this follow-up."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl className="mt-2 w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {followUpOutcomes.map((outcome) => (
                        <SelectItem key={outcome} value={outcome}>
                          {followUpOutcomeLabels[outcome]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Add completion notes" rows={3} disabled={isPending} {...field} />
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Mark Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
