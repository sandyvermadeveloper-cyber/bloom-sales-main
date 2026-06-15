"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { adminEmployeesApi } from "@/api/employees.api"
import { getCustomerName } from "@/components/customers/customers.utils"
import { SearchableSelect } from "@/components/leads/lead-searchable-select"
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
import { customerAssignSchema, type CustomerAssignFormValues } from "@/schemas/customer.schemas"
import type { Customer } from "@/types/customer"
import { applyApiFieldErrors } from "@/utils/form-errors"

const assignFields = ["employeeId", "reason"] as const

const defaultAssignValues: CustomerAssignFormValues = {
  employeeId: "",
  reason: "",
}

type CustomerAssignDialogProps = {
  open: boolean
  customer: Customer | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CustomerAssignFormValues) => void
}

export function CustomerAssignDialog({
  open,
  customer,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: CustomerAssignDialogProps) {
  const [employeeSearch, setEmployeeSearch] = useState("")
  const form = useForm<CustomerAssignFormValues>({
    resolver: zodResolver(customerAssignSchema),
    defaultValues: defaultAssignValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(defaultAssignValues)
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, assignFields)
  }, [error, form])

  const employeesQuery = useQuery({
    queryKey: ["admin-employees", "customer-assign-options", employeeSearch],
    queryFn: () => adminEmployeesApi.list({ page: 1, limit: 20, search: employeeSearch || undefined }),
    enabled: open && employeeSearch.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  const employeeOptions = useMemo(
    () =>
      (employeesQuery.data?.data.employees ?? []).map((employee) => ({
        value: employee.id,
        label: employee.displayName || `${employee.firstName} ${employee.lastName}`.trim() || employee.email,
      })),
    [employeesQuery.data]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setEmployeeSearch("")
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign customer</DialogTitle>
          <DialogDescription>
            Assign {customer ? getCustomerName(customer) : "this customer"} to a team member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl className="mt-2">
                    <SearchableSelect
                      value={field.value}
                      options={employeeOptions}
                      placeholder={employeesQuery.isLoading ? "Loading employees" : "Select employee"}
                      searchPlaceholder="Search employees..."
                      disabled={isPending || employeesQuery.isLoading}
                      onSearchChange={setEmployeeSearch}
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
                  <FormLabel>Reason</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Why is this customer being assigned?" disabled={isPending} rows={3} {...field} />
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
