"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserCog } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"

import { SearchableSelect } from "@/components/crm/leads/lead-searchable-select"
import { getFollowUpLeadLabel } from "@/components/crm/follow-ups/follow-ups.utils"
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
import { Textarea } from "@/components/ui/textarea"
import {
  followUpAssignSchema,
  type FollowUpAssignFormValues,
} from "@/schemas/follow-up.schemas"
import type { Employee } from "@/types/employee"
import type { FollowUp } from "@/types/follow-up"
import { applyApiFieldErrors } from "@/utils/form-errors"

const assignFields = ["employeeId", "reason"] as const

type FollowUpAssignDialogProps = {
  open: boolean
  followUp: FollowUp | null
  isPending: boolean
  error: unknown
  message: string | null
  employees: Employee[]
  isLoadingEmployees?: boolean
  onEmployeeSearchChange?: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FollowUpAssignFormValues) => void
}

export function FollowUpAssignDialog({
  open,
  followUp,
  isPending,
  error,
  message,
  employees,
  isLoadingEmployees = false,
  onEmployeeSearchChange,
  onOpenChange,
  onSubmit,
}: FollowUpAssignDialogProps) {
  const form = useForm<FollowUpAssignFormValues>({
    resolver: zodResolver(followUpAssignSchema),
    defaultValues: { employeeId: "", reason: "" },
  })

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
    form.reset({ employeeId: followUp?.assignedTo?.id ?? "", reason: "" })
  }, [followUp, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, assignFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Follow-Up</DialogTitle>
          <DialogDescription>
            {followUp ? `Assign the follow-up for ${getFollowUpLeadLabel(followUp)}.` : "Assign this follow-up."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <FormControl className="mt-2">
                    <SearchableSelect
                      value={field.value}
                      options={employeeOptions}
                      placeholder={isLoadingEmployees ? "Loading employees" : "Select employee"}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Add a reason for this assignment" rows={3} disabled={isPending} {...field} />
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserCog className="size-4" />}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
