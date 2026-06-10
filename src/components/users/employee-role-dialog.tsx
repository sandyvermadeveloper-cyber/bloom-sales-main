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
import { roleLabels } from "@/constants/employee-display"
import {
  employeeRoleSchema,
  type EmployeeRoleFormValues,
} from "@/schemas/employee.schemas"
import { roles } from "@/types/auth"
import type { Employee } from "@/types/employee"

type EmployeeRoleDialogProps = {
  open: boolean
  employee: Employee | null
  isPending: boolean
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: EmployeeRoleFormValues) => void
}

export function EmployeeRoleDialog({
  open,
  employee,
  isPending,
  message,
  onOpenChange,
  onSubmit,
}: EmployeeRoleDialogProps) {
  const form = useForm<EmployeeRoleFormValues>({
    resolver: zodResolver(employeeRoleSchema),
    defaultValues: { role: "sales" },
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({ role: employee?.role ?? "sales" })
  }, [employee, form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change employee role</DialogTitle>
          <DialogDescription>Changing role revokes the employee&apos;s existing sessions.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {roleLabels[role]}
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
                Update role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
