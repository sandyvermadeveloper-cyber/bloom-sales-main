import { z } from "zod"

export const e164PhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+[1-9][0-9]{7,14}$/,
    "Phone number must be in international format (e.g. +919876543210)"
  )
