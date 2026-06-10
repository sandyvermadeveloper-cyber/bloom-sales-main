import { z } from "zod"

import { e164PhoneSchema } from "@/schemas/phone.schemas"
import { roles } from "@/types/auth"
import type { EmployeeMutableStatus } from "@/types/employee"

const mutableStatuses = ["active", "suspended", "archived"] as const satisfies readonly EmployeeMutableStatus[]

export const employeeProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  displayName: z.string().trim().min(1, "Display name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: e164PhoneSchema,
})

export const employeeInviteSchema = employeeProfileSchema.extend({
  role: z.enum(roles, {
    message: "Select a valid role",
  }),
})

export const employeeRoleSchema = z.object({
  role: z.enum(roles, {
    message: "Select a valid role",
  }),
})

export const employeeStatusSchema = z.object({
  status: z.enum(mutableStatuses, {
    message: "Select a valid status",
  }),
})

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>
export type EmployeeInviteFormValues = z.infer<typeof employeeInviteSchema>
export type EmployeeRoleFormValues = z.infer<typeof employeeRoleSchema>
export type EmployeeStatusFormValues = z.infer<typeof employeeStatusSchema>
