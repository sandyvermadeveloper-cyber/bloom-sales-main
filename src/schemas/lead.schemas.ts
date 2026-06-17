import { z } from "zod"

import { customerTypes } from "@/components/customers/customers.constants"
import { leadPriorities, leadQualifications, leadStatuses } from "@/components/leads/leads.constants"
import { e164PhoneSchema } from "@/schemas/phone.schemas"

const contactLabels = ["WORK", "PERSONAL"] as const

const optionalAmount = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || Number.isFinite(Number(value)), "Please enter a valid amount")
  .refine((value) => !value || Number(value) >= 0, "Amount cannot be negative")

const contactPhoneSchema = z.object({
  phone: e164PhoneSchema,
  label: z.enum(contactLabels),
})

const contactEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid contact email"),
  label: z.enum(contactLabels),
})

export const leadContactSchema = z.object({
  firstName: z.string().trim().min(1, "Contact first name is required"),
  lastName: z.string().trim().min(1, "Contact last name is required"),
  designation: z.string().trim().optional(),
  phones: z.array(contactPhoneSchema).min(1, "Add at least one phone number"),
  emails: z.array(contactEmailSchema).min(1, "Add at least one email address"),
})

const leadBaseSchema = z.object({
  title: z.string().trim().min(1, "Lead title is required"),
  sourceId: z.string().trim().min(1, "Source is required"),
  serviceIds: z.array(z.string().trim().min(1)).min(1, "Select at least one service"),
  summary: z.string().trim().optional(),
  budgetMin: optionalAmount,
  budgetMax: optionalAmount,
  priority: z.enum(leadPriorities),
  qualification: z.enum(leadQualifications),
  expectedClosingDate: z.string().trim().optional(),
  existingContactIds: z.array(z.string().trim().min(1)),
  newContacts: z.array(leadContactSchema),
})

const validateBudgetRange = (values: { budgetMin?: string; budgetMax?: string }) =>
  !values.budgetMin ||
  !values.budgetMax ||
  Number(values.budgetMin) <= Number(values.budgetMax)

export const leadSchema = leadBaseSchema.refine(validateBudgetRange, {
  path: ["budgetMax"],
  message: "Maximum budget must be greater than minimum budget",
}).refine((values) => values.existingContactIds.length > 0 || values.newContacts.length > 0, {
  path: ["existingContactIds"],
  message: "Select an existing contact or add a new contact",
})

export const leadUpdateSchema = leadBaseSchema
  .pick({
    title: true,
    sourceId: true,
    summary: true,
    budgetMin: true,
    budgetMax: true,
    priority: true,
    qualification: true,
    expectedClosingDate: true,
  })
  .refine(
    (values) =>
      validateBudgetRange(values),
    {
      path: ["budgetMax"],
      message: "Maximum budget must be greater than minimum budget",
    }
  )

export type LeadFormValues = z.infer<typeof leadSchema>

export type LeadUpdateFormValues = z.infer<typeof leadUpdateSchema>

export const leadStatusChangeSchema = z.object({
  status: z.enum(leadStatuses),
})

export type LeadStatusChangeFormValues = z.infer<typeof leadStatusChangeSchema>

export const leadConvertSchema = z.object({
  customerType: z.enum(customerTypes),
})

export type LeadConvertFormValues = z.infer<typeof leadConvertSchema>

export const leadAssignSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee"),
  reason: z.string().trim().min(1, "Reason is required"),
})

export type LeadAssignFormValues = z.infer<typeof leadAssignSchema>
