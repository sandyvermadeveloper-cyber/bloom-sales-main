"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, FileText, Flag, Layers, Loader2, NotebookText, Wallet } from "lucide-react"
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

const fieldLabelClass = "text-xs font-medium text-muted-foreground"

function SectionHeader({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  )
}

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
      <DialogContent className="bottom-4 left-auto right-4 top-4 max-h-[calc(100vh-2rem)] w-[min(460px,calc(100%-2rem))] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto p-0 sm:max-w-none">
        <DialogHeader className="border-b border-border/70 px-5 py-4 pr-10">
          <DialogTitle className="text-base font-semibold">Edit lead</DialogTitle>
          <DialogDescription className="text-xs">
            Update top-level lead details. Contacts and services are managed in the next workflow.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 px-5 py-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            {optionsMessage ? <Alert variant="destructive">{optionsMessage}</Alert> : null}

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <SectionHeader icon={FileText} title="Lead details" />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelClass}>Lead title</FormLabel>
                      <FormControl>
                        <Input className="h-9 bg-background" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sourceId"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className={fieldLabelClass}>
                          <span className="inline-flex items-center gap-1">
                            <Layers className="size-3" />
                            Source
                          </span>
                        </FormLabel>
                        <Select disabled={isPending || isLoadingOptions} value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="h-9 w-full bg-background">
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
                      <FormItem className="space-y-1.5">
                        <FormLabel className={fieldLabelClass}>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            Expected closing
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input type="date" className="h-9 bg-background" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <SectionHeader icon={Flag} title="Classification" />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelClass}>Priority</FormLabel>
                      <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9 w-full bg-background">
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
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelClass}>Qualification</FormLabel>
                      <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9 w-full bg-background">
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
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <SectionHeader icon={Wallet} title="Budget range" />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelClass}>Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="h-9 bg-background"
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelClass}>Maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="h-9 bg-background"
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <SectionHeader icon={NotebookText} title="Summary" />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormControl>
                      <Textarea
                        className="resize-none bg-background"
                        rows={4}
                        placeholder="Add a short summary about this lead..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="mx-0 mb-0 rounded-b-none border-t border-border/70 bg-background px-5 py-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" disabled={isPending || isLoadingOptions} onClick={form.handleSubmit(onSubmit)}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
