"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Mail, Phone, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { contactLabels } from "@/components/customers/customers.constants"
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
import { customerContactSchema } from "@/schemas/customer.schemas"

export type CustomerContactFormValues = z.infer<typeof customerContactSchema>

const fieldLabelClass = "text-xs font-medium text-muted-foreground"

const defaultContactValues: CustomerContactFormValues = {
  firstName: "",
  lastName: "",
  designation: "",
  phones: [{ phone: "", label: "WORK" }],
  emails: [{ email: "", label: "WORK" }],
}

type CustomerContactDialogProps = {
  open: boolean
  isPending?: boolean
  message?: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CustomerContactFormValues) => void
}

export function CustomerContactDialog({
  open,
  isPending,
  message,
  onOpenChange,
  onSubmit,
}: CustomerContactDialogProps) {
  const form = useForm<CustomerContactFormValues>({
    resolver: zodResolver(customerContactSchema),
    defaultValues: defaultContactValues,
  })
  const phoneFields = useFieldArray({ control: form.control, name: "phones" })
  const emailFields = useFieldArray({ control: form.control, name: "emails" })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(defaultContactValues)
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add new contact</DialogTitle>
          <DialogDescription className="text-xs">
            Add contact details for this customer. Phone numbers must use international format.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={fieldLabelClass}>First name</FormLabel>
                    <FormControl>
                      <Input className="h-9" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={fieldLabelClass}>Last name</FormLabel>
                    <FormControl>
                      <Input className="h-9" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 sm:col-span-2">
                    <FormLabel className={fieldLabelClass}>Designation</FormLabel>
                    <FormControl>
                      <Input className="h-9" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Phone className="size-3.5" />
                  </span>
                  <h3 className="text-sm font-semibold">Phone numbers</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  disabled={isPending}
                  onClick={() => phoneFields.append({ phone: "", label: "WORK" })}
                >
                  <Plus className="size-3.5" />
                  Add phone
                </Button>
              </div>
              <div className="space-y-2">
                {phoneFields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid items-start gap-2 rounded-md border border-border/60 bg-background p-2 sm:grid-cols-[1fr_120px_auto]"
                  >
                    <FormField
                      control={form.control}
                      name={`phones.${index}.phone`}
                      render={({ field: phoneField }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <PhoneInput className="h-9" placeholder="+919876543210" disabled={isPending} {...phoneField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`phones.${index}.label`}
                      render={({ field: labelField }) => (
                        <FormItem className="space-y-0">
                          <Select disabled={isPending} value={labelField.value} onValueChange={labelField.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactLabels.map((label) => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isPending || phoneFields.fields.length === 1}
                      onClick={() => phoneFields.remove(index)}
                      aria-label="Remove phone"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="size-3.5" />
                  </span>
                  <h3 className="text-sm font-semibold">Email addresses</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  disabled={isPending}
                  onClick={() => emailFields.append({ email: "", label: "WORK" })}
                >
                  <Plus className="size-3.5" />
                  Add email
                </Button>
              </div>
              <div className="space-y-2">
                {emailFields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid items-start gap-2 rounded-md border border-border/60 bg-background p-2 sm:grid-cols-[1fr_120px_auto]"
                  >
                    <FormField
                      control={form.control}
                      name={`emails.${index}.email`}
                      render={({ field: emailField }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input className="h-9" type="email" placeholder="name@example.com" disabled={isPending} {...emailField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`emails.${index}.label`}
                      render={({ field: labelField }) => (
                        <FormItem className="space-y-0">
                          <Select disabled={isPending} value={labelField.value} onValueChange={labelField.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactLabels.map((label) => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isPending || emailFields.fields.length === 1}
                      onClick={() => emailFields.remove(index)}
                      aria-label="Remove email"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Add contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
