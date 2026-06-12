import { z } from "zod"

import { customerStatuses, customerTypes } from "@/components/customers/customers.constants"
import { e164PhoneSchema } from "@/schemas/phone.schemas"

const contactLabels = ["WORK", "PERSONAL"] as const

const contactPhoneSchema = z.object({
  phone: e164PhoneSchema,
  label: z.enum(contactLabels),
})

const contactEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid contact email"),
  label: z.enum(contactLabels),
})

export const customerContactSchema = z.object({
  firstName: z.string().trim().min(1, "Contact first name is required"),
  lastName: z.string().trim().min(1, "Contact last name is required"),
  designation: z.string().trim().optional(),
  phones: z.array(contactPhoneSchema).min(1, "Add at least one phone number"),
  emails: z.array(contactEmailSchema).min(1, "Add at least one email address"),
})

const customerBaseSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  customerType: z.enum(customerTypes),
  ownerEmployeeId: z.string().trim().optional(),
  existingContactIds: z.array(z.string().trim().min(1)),
  newContacts: z.array(customerContactSchema),
})

export const customerSchema = customerBaseSchema

export type CustomerFormValues = z.infer<typeof customerSchema>

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  customerType: z.enum(customerTypes),
})

export type CustomerUpdateFormValues = z.infer<typeof customerUpdateSchema>

export const customerStatusChangeSchema = z
  .object({
    status: z.enum(customerStatuses),
    reason: z.string().trim().optional(),
  })
  .refine((values) => values.status !== "BLOCKED" || Boolean(values.reason), {
    path: ["reason"],
    message: "Please provide a reason when blocking a customer",
  })

export type CustomerStatusChangeFormValues = z.infer<typeof customerStatusChangeSchema>

export const customerAssignSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee"),
  reason: z.string().trim().min(1, "Reason is required"),
})

export type CustomerAssignFormValues = z.infer<typeof customerAssignSchema>
