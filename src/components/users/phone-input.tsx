"use client"

import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"

const normalizeE164Input = (value: string) => {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, "")

  return trimmed.startsWith("+") ? `+${digits}` : digits
}

type PhoneInputProps = Omit<ComponentProps<typeof Input>, "type" | "inputMode" | "pattern" | "onChange"> & {
  onChange: (event: { target: { value: string } }) => void
}

export function PhoneInput({ onChange, ...props }: PhoneInputProps) {
  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      pattern="\\+[1-9][0-9]{7,14}"
      onChange={(event) => {
        onChange({
          target: {
            value: normalizeE164Input(event.target.value),
          },
        })
      }}
    />
  )
}
