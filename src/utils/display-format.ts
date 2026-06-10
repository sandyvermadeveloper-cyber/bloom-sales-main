const acronymPattern = /^[A-Z0-9]{2,}$/

export const formatTitleCase = (value: string | null | undefined) => {
  const normalizedValue = normalizeSpaces(value)
  if (!normalizedValue) return "-"

  return normalizedValue
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => {
          if (!part) return part
          if (acronymPattern.test(part)) return part

          return `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`
        })
        .join("-")
    )
    .join(" ")
}

export const formatDisplayName = formatTitleCase

export const formatDesignation = formatTitleCase

export const formatEmail = (value: string | null | undefined) => {
  const normalizedValue = normalizeSpaces(value)

  return normalizedValue ? normalizedValue.toLowerCase() : "-"
}

export const formatCode = (value: string | null | undefined) => {
  const normalizedValue = normalizeSpaces(value)

  return normalizedValue ? normalizedValue.toUpperCase() : "-"
}

export const formatDescription = (value: string | null | undefined) => {
  const normalizedValue = normalizeSpaces(value)
  if (!normalizedValue) return "-"

  return `${normalizedValue[0]?.toUpperCase() ?? ""}${normalizedValue.slice(1)}`
}

export const formatPhoneNumber = (value: string | null | undefined) => {
  const normalizedValue = normalizeSpaces(value)
  if (!normalizedValue) return "-"

  const e164Match = normalizedValue.match(/^\+([1-9]\d{0,2})(\d{10})$/)
  if (e164Match) {
    const [, countryCode, subscriberNumber] = e164Match

    return `+${countryCode} ${subscriberNumber.slice(0, 5)} ${subscriberNumber.slice(5)}`
  }

  return normalizedValue
}

const normalizeSpaces = (value: string | null | undefined) => {
  return (value ?? "").trim().replace(/\s+/g, " ")
}
