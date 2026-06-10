import { z } from "zod"

export const leadSourceSchema = z.object({
  name: z.string().trim().min(1, "Lead source name is required"),
  description: z.string().trim().optional(),
})

export type LeadSourceFormValues = z.infer<typeof leadSourceSchema>
