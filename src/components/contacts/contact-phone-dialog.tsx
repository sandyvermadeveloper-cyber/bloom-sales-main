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
import { PhoneInput } from "@/components/users/phone-input"
import { contactLabels, contactPhoneFields } from "@/components/contacts/contacts.constants"
import { contactPhoneSchema, type ContactPhoneFormValues } from "@/schemas/contact.schemas"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultPhoneValues: ContactPhoneFormValues = {
  phone: "",
  label: "WORK",
}

type ContactPhoneDialogProps = {
  open: boolean
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ContactPhoneFormValues) => void
}

export function ContactPhoneDialog({
  open,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: ContactPhoneDialogProps) {
  const form = useForm<ContactPhoneFormValues>({
    resolver: zodResolver(contactPhoneSchema),
    defaultValues: defaultPhoneValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(defaultPhoneValues)
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, contactPhoneFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add phone</DialogTitle>
          <DialogDescription>Phone number must use international E.164 format.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl className="mt-2">
                    <PhoneInput placeholder="+919876543210" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl className="mt-2">
                      <SelectTrigger>
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contactLabels.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
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
                Close
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Add phone
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
