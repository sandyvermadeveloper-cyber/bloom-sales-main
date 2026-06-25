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
import { Input } from "@/components/ui/input"
import { contactProfileFields } from "@/components/crm/contacts/contacts.constants"
import { contactToProfileValues } from "@/components/crm/contacts/contacts.utils"
import {
  contactProfileSchema,
  type ContactProfileFormValues,
} from "@/schemas/contact.schemas"
import type { Contact } from "@/types/contact"
import { applyApiFieldErrors } from "@/utils/form-errors"

type ContactProfileDialogProps = {
  open: boolean
  contact: Contact | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ContactProfileFormValues) => void
}

export function ContactProfileDialog({
  open,
  contact,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: ContactProfileDialogProps) {
  const form = useForm<ContactProfileFormValues>({
    resolver: zodResolver(contactProfileSchema),
    defaultValues: contactToProfileValues(null),
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(contactToProfileValues(contact))
  }, [contact, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, contactProfileFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit contact profile</DialogTitle>
          <DialogDescription>Update basic contact details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl className="mt-2">
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl className="mt-2">
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl className="mt-2">
                    <Input disabled={isPending} {...field} />
                  </FormControl>
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
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
