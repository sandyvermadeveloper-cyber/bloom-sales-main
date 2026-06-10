import { Badge } from "@/components/ui/badge"
import {
  getContactLabelBadgeClasses,
  getContactLabelText,
} from "@/constants/contact-display"
import { cn } from "@/lib/utils"

type ContactLabelBadgeProps = {
  label: string | null | undefined
  className?: string
}

export function ContactLabelBadge({ label, className }: ContactLabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getContactLabelBadgeClasses(label), "whitespace-nowrap", className)}
    >
      {getContactLabelText(label)}
    </Badge>
  )
}
