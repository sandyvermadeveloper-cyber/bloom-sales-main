"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarPlus, Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"

import { SearchableSelect } from "@/components/leads/lead-searchable-select"
import {
  followUpFields,
  followUpTypeLabels,
  followUpTypes,
} from "@/components/follow-ups/follow-ups.constants"
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
import { followUpSchema, type FollowUpFormValues } from "@/schemas/follow-up.schemas"
import type { Employee } from "@/types/employee"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultFollowUpValues: FollowUpFormValues = {
  leadId: "",
  type: "CALL",
  customType: "",
  scheduledAt: "",
  notes: "",
  assignedToEmployeeId: "",
}

type FollowUpDialogProps = {
  open: boolean
  isPending: boolean
  error: unknown
  message: string | null
  leadId?: string
  leadLabel?: string
  leadOptions?: Array<{ value: string; label: string }>
  isLoadingLeadOptions?: boolean
  onLeadSearchChange?: (value: string) => void
  employees: Employee[]
  isLoadingEmployees?: boolean
  onEmployeeSearchChange?: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FollowUpFormValues) => void
}

export function FollowUpDialog({
  open,
  isPending,
  error,
  message,
  leadId,
  leadLabel,
  leadOptions = [],
  isLoadingLeadOptions = false,
  onLeadSearchChange,
  employees,
  isLoadingEmployees = false,
  onEmployeeSearchChange,
  onOpenChange,
  onSubmit,
}: FollowUpDialogProps) {
  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: defaultFollowUpValues,
  })
  const type = useWatch({ control: form.control, name: "type" })

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label:
          employee.displayName ||
          `${employee.firstName} ${employee.lastName}`.trim() ||
          employee.email,
      })),
    [employees]
  )

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({ ...defaultFollowUpValues, leadId: leadId ?? "" })
  }, [form, leadId, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, followUpFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Follow-Up</DialogTitle>
          <DialogDescription>
            {leadLabel
              ? `Schedule a follow-up task for ${leadLabel}.`
              : "Schedule a follow-up task for a lead."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            {!leadId ? (
              <FormField
                control={form.control}
                name="leadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead</FormLabel>
                    <FormControl className="mt-2">
                      <div className="space-y-2">
                        <SearchableSelect
                          value={field.value}
                          options={leadOptions}
                          placeholder={isLoadingLeadOptions ? "Loading leads" : "Select lead"}
                          searchPlaceholder="Search leads..."
                          disabled={isPending}
                          onSearchChange={onLeadSearchChange}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl className="mt-2 w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {followUpTypes.map((followUpType) => (
                          <SelectItem key={followUpType} value={followUpType}>
                            {followUpTypeLabels[followUpType]}
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
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled At</FormLabel>
                    <FormControl className="mt-2">
                      <Input type="datetime-local" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {type === "OTHER" ? (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Type</FormLabel>
                    <FormControl className="mt-2">
                      <Input placeholder="Describe the follow-up type" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="assignedToEmployeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <FormControl className="mt-2">
                    <SearchableSelect
                      value={field.value ?? ""}
                      options={employeeOptions}
                      placeholder={isLoadingEmployees ? "Loading employees" : "Unassigned"}
                      searchPlaceholder="Search employees..."
                      disabled={isPending || isLoadingEmployees}
                      onSearchChange={onEmployeeSearchChange}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Add notes for this follow-up" rows={3} disabled={isPending} {...field} />
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
                Schedule Follow-Up
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
