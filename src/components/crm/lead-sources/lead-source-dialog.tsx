"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { leadSourceFields } from "@/components/crm/lead-sources/lead-sources.constants"
import { leadSourceToFormValues } from "@/components/crm/lead-sources/lead-sources.utils"
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
import { leadSourceSchema, type LeadSourceFormValues } from "@/schemas/lead-source.schemas"
import type { LeadSource } from "@/types/lead-source"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultLeadSourceValues: LeadSourceFormValues = {
  name: "",
  description: "",
}

type LeadSourceDialogProps = {
  mode: "create" | "edit"
  open: boolean
  leadSource?: LeadSource | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadSourceFormValues) => void
}

export function LeadSourceDialog({
  mode,
  open,
  leadSource,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: LeadSourceDialogProps) {
  const form = useForm<LeadSourceFormValues>({
    resolver: zodResolver(leadSourceSchema),
    defaultValues: defaultLeadSourceValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(leadSource ? leadSourceToFormValues(leadSource) : defaultLeadSourceValues)
  }, [form, leadSource, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, leadSourceFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add lead source" : "Edit lead source"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a lead source." : "Update lead source details."}
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
                  <FormLabel>Lead Source Name</FormLabel>
                  <FormControl className="mt-2">
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
                  <FormControl className="mt-2">
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
                {mode === "create" ? "Create lead source" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
