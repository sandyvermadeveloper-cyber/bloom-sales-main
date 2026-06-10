export const contactLabelBadgeClasses: Record<string, string> = {
  WORK: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  PERSONAL: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
}

const fallbackBadgeClasses = "border-border bg-muted text-muted-foreground"

export const normalizeContactLabel = (label: string | null | undefined) => {
  const normalizedLabel = label?.toUpperCase()

  return normalizedLabel && normalizedLabel in contactLabelBadgeClasses ? normalizedLabel : null
}

export const getContactLabelText = (label: string | null | undefined) => {
  return normalizeContactLabel(label) ?? label?.toUpperCase() ?? "UNKNOWN"
}

export const getContactLabelBadgeClasses = (label: string | null | undefined) => {
  const normalizedLabel = normalizeContactLabel(label)

  return normalizedLabel ? contactLabelBadgeClasses[normalizedLabel] : fallbackBadgeClasses
}
