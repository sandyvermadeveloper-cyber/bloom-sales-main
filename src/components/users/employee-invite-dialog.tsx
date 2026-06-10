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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhoneInput } from "@/components/users/phone-input"
import { roleLabels } from "@/constants/employee-display"
import { inviteFields } from "@/components/users/users.constants"
import { employeeToInviteValues } from "@/components/users/users.utils"
import {
  employeeInviteSchema,
  type EmployeeInviteFormValues,
} from "@/schemas/employee.schemas"
import { roles, type AdminRole } from "@/types/auth"
import type { Employee, EmployeeInviteData } from "@/types/employee"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultInviteValues: EmployeeInviteFormValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  phone: "",
  role: "sales",
}

type EmployeeInviteDialogProps = {
  mode: "create" | "resend"
  open: boolean
  employee?: Employee | null
  isPending: boolean
  error: unknown
  message: string | null
  inviteResult: EmployeeInviteData | null
  currentEmployeeRole?: AdminRole | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: EmployeeInviteFormValues) => void
}

export function EmployeeInviteDialog({
  mode,
  open,
  employee,
  isPending,
  error,
  message,
  inviteResult,
  currentEmployeeRole,
  onOpenChange,
  onSubmit,
}: EmployeeInviteDialogProps) {
  const form = useForm<EmployeeInviteFormValues>({
    resolver: zodResolver(employeeInviteSchema),
    defaultValues: defaultInviteValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(employee ? employeeToInviteValues(employee) : defaultInviteValues)
  }, [employee, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, inviteFields)
  }, [error, form])

  const selectableRoles =
    mode === "create" && currentEmployeeRole === "manager"
      ? roles.filter((role) => role !== "admin" && role !== "manager")
      : roles

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add employee" : "Resend employee invite"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create an employee invite with their account details."
              : "Review or correct the employee details before sending a new invite."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? (
              <div className="sm:col-span-2">
                <Alert variant={inviteResult ? "success" : "destructive"}>{message}</Alert>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <PhoneInput autoComplete="tel" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableRoles.map((role) => (
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

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "create" ? "Send invite" : "Resend invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
