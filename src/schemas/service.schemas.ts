import { z } from "zod"

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Service name is required"),
  description: z.string().trim().optional(),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
