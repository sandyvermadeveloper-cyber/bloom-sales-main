import { Award } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getRoleBadgeClasses,
  getRoleLabel,
} from "@/constants/employee-display"

type RoleBadgeProps = {
  role: string | null | undefined
  className?: string
  showIcon?: boolean
}

export function RoleBadge({ role, className, showIcon = false }: RoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getRoleBadgeClasses(role), "capitalize", className)}
    >
      {showIcon ? <Award className="mr-1 size-3" aria-hidden="true" /> : null}
      {getRoleLabel(role)}
    </Badge>
  )
}
