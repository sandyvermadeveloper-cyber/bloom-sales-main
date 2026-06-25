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
import { Textarea } from "@/components/ui/textarea"
import { serviceFields } from "@/components/crm/services/services.constants"
import { serviceToFormValues } from "@/components/crm/services/services.utils"
import { serviceSchema, type ServiceFormValues } from "@/schemas/service.schemas"
import type { Service } from "@/types/service"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultServiceValues: ServiceFormValues = {
  name: "",
  description: "",
}

type ServiceDialogProps = {
  mode: "create" | "edit"
  open: boolean
  service?: Service | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ServiceFormValues) => void
}

export function ServiceDialog({
  mode,
  open,
  service,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: ServiceDialogProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultServiceValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(service ? serviceToFormValues(service) : defaultServiceValues)
  }, [form, open, service])

  useEffect(() => {
    applyApiFieldErrors(error, form, serviceFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add service" : "Edit service"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a service. "
              : "Update service details. "}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl className=" mt-2">
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl className=" mt-2">
                    <Textarea disabled={isPending} rows={4} {...field} />
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
                {mode === "create" ? "Create service" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
