"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  leadPriorities,
  leadPriorityLabels,
  leadQualifications,
  leadQualificationLabels,
  leadUpdateFields,
} from "@/components/leads/leads.constants"
import { leadToUpdateFormValues } from "@/components/leads/leads.utils"
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
import { Textarea } from "@/components/ui/textarea"
import { leadUpdateSchema, type LeadUpdateFormValues } from "@/schemas/lead.schemas"
import type { Lead } from "@/types/lead"
import type { LeadSource } from "@/types/lead-source"
import { applyApiFieldErrors } from "@/utils/form-errors"

type LeadEditDialogProps = {
  open: boolean
  lead: Lead | null
  isPending: boolean
  error: unknown
  message: string | null
  optionsMessage: string | null
  sources: LeadSource[]
  isLoadingOptions: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadUpdateFormValues) => void
}

export function LeadEditDialog({
  open,
  lead,
  isPending,
  error,
  message,
  optionsMessage,
  sources,
  isLoadingOptions,
  onOpenChange,
  onSubmit,
}: LeadEditDialogProps) {
  const form = useForm<LeadUpdateFormValues>({
    resolver: zodResolver(leadUpdateSchema),
    defaultValues: {
      title: "",
      sourceId: "",
      summary: "",
      budgetMin: "",
      budgetMax: "",
      priority: "HIGH",
      qualification: "WARM",
      expectedClosingDate: "",
    },
  })

  useEffect(() => {
    if (!open || !lead) return
    form.clearErrors()
    form.reset(leadToUpdateFormValues(lead))
  }, [form, lead, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, leadUpdateFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-4 left-auto right-4 top-4 max-h-[calc(100vh-2rem)] w-[min(430px,calc(100%-2rem))] max-w-none translate-x-0 translate-y-0 overflow-y-auto p-5 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Edit lead</DialogTitle>
          <DialogDescription>Update top-level lead details. Contacts and services are managed in the next workflow.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            {optionsMessage ? <Alert variant="destructive">{optionsMessage}</Alert> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Lead Title</FormLabel>
                    <FormControl className="mt-2">
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select disabled={isPending || isLoadingOptions} value={field.value} onValueChange={field.onChange}>
                      <FormControl className="mt-2">
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOptions ? "Loading sources" : "Select source"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.label || source.name || source.id}
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
                name="expectedClosingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Closing Date</FormLabel>
                    <FormControl className="mt-2">
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                      <FormControl className="mt-2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadPriorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {leadPriorityLabels[priority]}
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
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                      <FormControl className="mt-2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadQualifications.map((qualification) => (
                          <SelectItem key={qualification} value={qualification}>
                            {leadQualificationLabels[qualification]}
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
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Min</FormLabel>
                    <FormControl className="mt-2">
                      <Input type="number" min="0" disabled={isPending} value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Max</FormLabel>
                    <FormControl className="mt-2">
                      <Input type="number" min="0" disabled={isPending} value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
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
              <Button type="submit" disabled={isPending || isLoadingOptions}>
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
