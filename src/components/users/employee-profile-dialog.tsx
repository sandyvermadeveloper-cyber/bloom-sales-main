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
import { PhoneInput } from "@/components/users/phone-input"
import { profileFields } from "@/components/users/users.constants"
import { employeeToProfileValues } from "@/components/users/users.utils"
import {
  employeeProfileSchema,
  type EmployeeProfileFormValues,
} from "@/schemas/employee.schemas"
import type { Employee } from "@/types/employee"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultProfileValues: EmployeeProfileFormValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  phone: "",
}

type EmployeeProfileDialogProps = {
  open: boolean
  employee: Employee | null
  isPending: boolean
  error: unknown
  message: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: EmployeeProfileFormValues) => void
}

export function EmployeeProfileDialog({
  open,
  employee,
  isPending,
  error,
  message,
  onOpenChange,
  onSubmit,
}: EmployeeProfileDialogProps) {
  const form = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: defaultProfileValues,
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(employee ? employeeToProfileValues(employee) : defaultProfileValues)
  }, [employee, form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, profileFields)
  }, [error, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit employee profile</DialogTitle>
          <DialogDescription>Update the employee contact and profile details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? (
              <div className="sm:col-span-2">
                <Alert variant="destructive">{message}</Alert>
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

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Update profile
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
