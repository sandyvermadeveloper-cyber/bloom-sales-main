import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getStatusBadgeClasses,
  getStatusLabel,
} from "@/constants/employee-display"

type StatusBadgeProps = {
  status: string | null | undefined
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getStatusBadgeClasses(status), "capitalize", className)}
    >
      {getStatusLabel(status)}
    </Badge>
  )
}
