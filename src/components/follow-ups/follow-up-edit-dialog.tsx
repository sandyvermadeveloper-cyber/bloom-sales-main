"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"

import { SearchableSelect } from "@/components/leads/lead-searchable-select"
import {
  followUpFields,
  followUpTypeLabels,
  followUpTypes,
} from "@/components/follow-ups/follow-ups.constants"
import { toDateTimeInputValue } from "@/components/follow-ups/follow-ups.utils"
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
import {
  followUpUpdateSchema,
  type FollowUpUpdateFormValues,
} from "@/schemas/follow-up.schemas"
import type { Employee } from "@/types/employee"
import type { FollowUp } from "@/types/follow-up"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultValues: FollowUpUpdateFormValues = {
  type: "CALL",
  customType: "",
  scheduledAt: "",
  notes: "",
  assignedToEmployeeId: "",
}

type FollowUpEditDialogProps = {
  open: boolean
  followUp: FollowUp | null
  isPending: boolean
  error: unknown
  message: string | null
  employees: Employee[]
  isLoadingEmployees?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FollowUpUpdateFormValues) => void
}

export function FollowUpEditDialog({
  open,
  followUp,
  isPending,
  error,
  message,
  employees,
  isLoadingEmployees = false,
  onOpenChange,
  onSubmit,
}: FollowUpEditDialogProps) {
  const form = useForm<FollowUpUpdateFormValues>({
    resolver: zodResolver(followUpUpdateSchema),
    defaultValues,
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
    if (!open || !followUp) return

    form.clearErrors()
    form.reset({
      type: followUp.type,
      customType: followUp.customType ?? "",
      scheduledAt: toDateTimeInputValue(followUp.scheduledAt),
      notes: followUp.notes ?? "",
      assignedToEmployeeId: followUp.assignedTo?.id ?? "",
    })
  }, [followUp, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, followUpFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Follow-Up</DialogTitle>
          <DialogDescription>Update the follow-up details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
