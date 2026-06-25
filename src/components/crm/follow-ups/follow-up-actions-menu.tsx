"use client"

import {
  AlarmClockOff,
  CalendarClock,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  UserCog,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FollowUp } from "@/types/follow-up"

type FollowUpActionsMenuProps = {
  followUp: FollowUp
  onView: (followUp: FollowUp) => void
  onEdit: (followUp: FollowUp) => void
  onAssign: (followUp: FollowUp) => void
  onComplete: (followUp: FollowUp) => void
  onReschedule: (followUp: FollowUp) => void
  onCancel: (followUp: FollowUp) => void
  onReopen: (followUp: FollowUp) => void
  onMarkMissed: (followUp: FollowUp) => void
}

export function FollowUpActionsMenu({
  followUp,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onReschedule,
  onCancel,
  onReopen,
  onMarkMissed,
}: FollowUpActionsMenuProps) {
  const isPending = followUp.status === "PENDING"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Open follow-up actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onView(followUp)}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>

        {isPending ? (
          <>
            <DropdownMenuItem onSelect={() => onEdit(followUp)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAssign(followUp)}>
              <UserCog className="size-4" />
              Assign
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onReschedule(followUp)}>
              <CalendarClock className="size-4" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onComplete(followUp)}>
              <CheckCircle2 className="size-4" />
              Mark complete
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onMarkMissed(followUp)}>
              <AlarmClockOff className="size-4" />
              Mark missed
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCancel(followUp)} className="text-destructive">
              <XCircle className="size-4" />
              Cancel
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={() => onReopen(followUp)}>
            <RotateCcw className="size-4" />
            Reopen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
