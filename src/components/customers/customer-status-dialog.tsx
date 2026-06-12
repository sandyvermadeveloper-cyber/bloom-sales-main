"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

import { customerStatusLabels, customerStatuses } from "@/components/customers/customers.constants"
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
  customerStatusChangeSchema,
  type CustomerStatusChangeFormValues,
} from "@/schemas/customer.schemas"
import type { Customer, CustomerStatus } from "@/types/customer"
import { applyApiFieldErrors } from "@/utils/form-errors"

const statusFields = ["status", "reason"] as const

type CustomerStatusDialogProps = {
  open: boolean
  customer: Customer | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CustomerStatusChangeFormValues) => void
}

export function CustomerStatusDialog({
  open,
  customer,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: CustomerStatusDialogProps) {
  const form = useForm<CustomerStatusChangeFormValues>({
    resolver: zodResolver(customerStatusChangeSchema),
    defaultValues: {
      status: "ACTIVE",
      reason: "",
    },
  })
  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  })

  useEffect(() => {
    if (!open) return
    const currentStatus = customerStatuses.includes(customer?.status as CustomerStatus)
      ? (customer?.status as CustomerStatus)
      : "ACTIVE"

    form.clearErrors()
    form.reset({ status: currentStatus, reason: "" })
  }, [customer, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, statusFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change customer status</DialogTitle>
          <DialogDescription>
            Update status for {customer ? getCustomerName(customer) : "this customer"}.
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
                      {customerStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {customerStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStatus === "BLOCKED" ? (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Reason</FormLabel>
                    <FormControl className="mt-2">
                      <Textarea
                        placeholder="Explain why this customer is being blocked"
                        disabled={isPending}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

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
