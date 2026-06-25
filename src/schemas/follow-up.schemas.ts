import { z } from "zod"

import { followUpOutcomes, followUpTypes } from "@/components/crm/follow-ups/follow-ups.constants"

export const followUpSchema = z
  .object({
    leadId: z.string().trim().min(1, "Lead is required"),
    type: z.enum(followUpTypes),
    customType: z.string().trim().optional(),
    scheduledAt: z.string().trim().min(1, "Scheduled date & time is required"),
    notes: z.string().trim().optional(),
    assignedToEmployeeId: z.string().trim().optional(),
  })
  .refine((values) => values.type !== "OTHER" || Boolean(values.customType?.length), {
    path: ["customType"],
    message: "Custom type is required when type is Other",
  })

export type FollowUpFormValues = z.infer<typeof followUpSchema>

export const followUpUpdateSchema = z
  .object({
    type: z.enum(followUpTypes),
    customType: z.string().trim().optional(),
    scheduledAt: z.string().trim().min(1, "Scheduled date & time is required"),
    notes: z.string().trim().optional(),
    assignedToEmployeeId: z.string().trim().optional(),
  })
  .refine((values) => values.type !== "OTHER" || Boolean(values.customType?.length), {
    path: ["customType"],
    message: "Custom type is required when type is Other",
  })

export type FollowUpUpdateFormValues = z.infer<typeof followUpUpdateSchema>

export const followUpAssignSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee"),
  reason: z.string().trim().optional(),
})

export type FollowUpAssignFormValues = z.infer<typeof followUpAssignSchema>

export const followUpCompleteSchema = z.object({
  outcome: z.enum(followUpOutcomes),
  notes: z.string().trim().optional(),
})

export type FollowUpCompleteFormValues = z.infer<typeof followUpCompleteSchema>

export const followUpRescheduleSchema = z.object({
  scheduledAt: z.string().trim().min(1, "Scheduled date & time is required"),
  reason: z.string().trim().optional(),
})

export type FollowUpRescheduleFormValues = z.infer<typeof followUpRescheduleSchema>

export const followUpReasonSchema = z.object({
  reason: z.string().trim().optional(),
})

export type FollowUpReasonFormValues = z.infer<typeof followUpReasonSchema>
