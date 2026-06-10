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
import { statusLabels } from "@/constants/employee-display"
import { mutableStatuses } from "@/components/users/users.constants"
import {
  employeeStatusSchema,
  type EmployeeStatusFormValues,
} from "@/schemas/employee.schemas"
import type { Employee } from "@/types/employee"

type EmployeeStatusDialogProps = {
  open: boolean
  employee: Employee | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: EmployeeStatusFormValues) => void
}

export function EmployeeStatusDialog({
  open,
  employee,
  isPending,
  message,
  onOpenChange,
  onSubmit,
}: EmployeeStatusDialogProps) {
  const form = useForm<EmployeeStatusFormValues>({
    resolver: zodResolver(employeeStatusSchema),
    defaultValues: { status: "active" },
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({
      status: employee?.status === "invited" ? "active" : employee?.status ?? "active",
    })
  }, [employee, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change employee status</DialogTitle>
          <DialogDescription>Changing status revokes the employee&apos;s existing sessions.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mutableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
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
                Update status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
