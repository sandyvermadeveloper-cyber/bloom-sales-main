import { z } from "zod"

export const e164PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9][0-9]{7,14}$/, "Phone number must be in international format (e.g. +919876543210)")

export const contactProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
  designation: z.string().trim().optional(),
})

export const contactPhoneSchema = z.object({
  phone: e164PhoneSchema,
  label: z.enum(["WORK", "PERSONAL"]),
})

export const contactEmailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  label: z.enum(["WORK", "PERSONAL"]),
})

export type ContactProfileFormValues = z.infer<typeof contactProfileSchema>
export type ContactPhoneFormValues = z.infer<typeof contactPhoneSchema>
export type ContactEmailFormValues = z.infer<typeof contactEmailSchema>
