"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { customerTypeLabels, customerTypes } from "@/components/crm/customers/customers.constants"
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
import {
  leadConvertSchema,
  type LeadConvertFormValues,
} from "@/schemas/lead.schemas"
import type { Lead } from "@/types/lead"
import { applyApiFieldErrors } from "@/utils/form-errors"

const convertFields = ["customerType"] as const

type LeadConvertDialogProps = {
  open: boolean
  lead: Lead | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadConvertFormValues) => void
}

export function LeadConvertDialog({
  open,
  lead,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: LeadConvertDialogProps) {
  const form = useForm<LeadConvertFormValues>({
    resolver: zodResolver(leadConvertSchema),
    defaultValues: {
      customerType: "BUSINESS",
    },
  })

  useEffect(() => {
    if (!open) return

    form.clearErrors()
    form.reset({ customerType: "BUSINESS" })
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, convertFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert lead</DialogTitle>
          <DialogDescription>
            Convert {lead ? getLeadTitle(lead) : "this lead"} into a customer. The lead will be moved to your customer records.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl className="mt-2 w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customerTypes.map((customerType) => (
                        <SelectItem key={customerType} value={customerType}>
                          {customerTypeLabels[customerType]}
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
                Convert lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
