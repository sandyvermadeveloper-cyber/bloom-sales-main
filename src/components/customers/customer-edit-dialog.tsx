"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { customerTypeLabels, customerTypes, customerUpdateFields } from "@/components/customers/customers.constants"
import { customerToUpdateFormValues } from "@/components/customers/customers.utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { customerUpdateSchema, type CustomerUpdateFormValues } from "@/schemas/customer.schemas"
import type { Customer } from "@/types/customer"
import { applyApiFieldErrors } from "@/utils/form-errors"

type CustomerEditDialogProps = {
  open: boolean
  customer: Customer | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CustomerUpdateFormValues) => void
}

export function CustomerEditDialog({
  open,
  customer,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: CustomerEditDialogProps) {
  const form = useForm<CustomerUpdateFormValues>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      name: "",
      customerType: "BUSINESS",
    },
  })

  useEffect(() => {
    if (!open || !customer) return
    form.clearErrors()
    form.reset(customerToUpdateFormValues(customer))
  }, [customer, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, customerUpdateFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
          <DialogDescription>Update the customer&apos;s name and type.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl className="mt-2">
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                    <FormControl className="mt-2 w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customerTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {customerTypeLabels[type]}
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
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
