"use client"

import {
  followUpOutcomeBadgeClasses,
  followUpStatusBadgeClasses,
  followUpTypeBadgeClasses,
} from "@/components/follow-ups/follow-ups.constants"
import {
  formatFollowUpDate,
  formatFollowUpDateTime,
  getFollowUpAssigneeName,
  getFollowUpContactName,
  getFollowUpCreatedByName,
  getFollowUpLeadLabel,
  getFollowUpOutcomeLabel,
  getFollowUpStatusLabel,
  getFollowUpTypeLabel,
} from "@/components/follow-ups/follow-ups.utils"
import {
  leadPriorityBadgeClasses,
  leadQualificationBadgeClasses,
  leadStatusBadgeClasses,
} from "@/components/leads/leads.constants"
import {
  getLeadPriorityLabel,
  getLeadQualificationLabel,
  getLeadStatusLabel,
} from "@/components/leads/leads.utils"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCode, formatDisplayName, formatPhoneNumber } from "@/utils/display-format"
import type { FollowUp } from "@/types/follow-up"

type FollowUpDetailDialogProps = {
  open: boolean
  followUp: FollowUp | null
  onOpenChange: (open: boolean) => void
}

export function FollowUpDetailDialog({ open, followUp, onOpenChange }: FollowUpDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Follow-Up Details
            {followUp?.followUpNumber ? (
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                {formatCode(followUp.followUpNumber)}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {followUp ? getFollowUpLeadLabel(followUp) : "Follow-up information"}
          </DialogDescription>
        </DialogHeader>

        {followUp ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn(followUpTypeBadgeClasses[followUp.type])}>
                {getFollowUpTypeLabel(followUp.type, followUp.customType)}
              </Badge>
              <Badge variant="outline" className={cn(followUpStatusBadgeClasses[followUp.status])}>
                {getFollowUpStatusLabel(followUp.status)}
              </Badge>
              {followUp.outcome ? (
                <Badge variant="outline" className={cn(followUpOutcomeBadgeClasses[followUp.outcome])}>
                  {getFollowUpOutcomeLabel(followUp.outcome)}
                </Badge>
              ) : null}
              {followUp.isOverdue ? (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  Overdue
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Scheduled At" value={formatFollowUpDateTime(followUp.scheduledAt)} />
              <DetailRow label="Assigned To" value={getFollowUpAssigneeName(followUp)} />
              <DetailRow label="Created By" value={getFollowUpCreatedByName(followUp)} />
              {followUp.completedAt ? (
                <DetailRow label="Completed At" value={formatFollowUpDateTime(followUp.completedAt)} />
              ) : null}
              {followUp.completedBy?.name ? (
                <DetailRow label="Completed By" value={formatDisplayName(followUp.completedBy.name)} />
              ) : null}
            </div>

            {followUp.lead ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Lead</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{getFollowUpLeadLabel(followUp)}</p>
                    {followUp.lead.leadNumber ? (
                      <p className="font-mono text-xs text-muted-foreground">{formatCode(followUp.lead.leadNumber)}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {followUp.lead.status ? (
                      <Badge variant="outline" className={cn(leadStatusBadgeClasses[followUp.lead.status] ?? "border-border bg-muted text-muted-foreground")}>
                        {getLeadStatusLabel(followUp.lead.status)}
                      </Badge>
                    ) : null}
                    {followUp.lead.priority ? (
                      <Badge variant="outline" className={cn(leadPriorityBadgeClasses[followUp.lead.priority] ?? "border-border bg-muted text-muted-foreground")}>
                        {getLeadPriorityLabel(followUp.lead.priority)}
                      </Badge>
                    ) : null}
                    {followUp.lead.qualification ? (
                      <Badge variant="outline" className={cn(leadQualificationBadgeClasses[followUp.lead.qualification] ?? "border-border bg-muted text-muted-foreground")}>
                        {getLeadQualificationLabel(followUp.lead.qualification)}
                      </Badge>
                    ) : null}
                  </div>
                  {followUp.lead.expectedClosingDate ? (
                    <DetailRow label="Expected Closing" value={formatFollowUpDate(followUp.lead.expectedClosingDate)} />
                  ) : null}
                </div>
              </div>
            ) : null}

            {followUp.primaryContact || followUp.companyName ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Contact</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {followUp.companyName ? <DetailRow label="Company" value={followUp.companyName} /> : null}
                  {followUp.primaryContact?.fullName ? (
                    <DetailRow label="Contact" value={getFollowUpContactName(followUp)} />
                  ) : null}
                  {followUp.primaryContact?.designation ? (
                    <DetailRow label="Designation" value={followUp.primaryContact.designation} />
                  ) : null}
                  {followUp.primaryContact?.primaryPhone ? (
                    <DetailRow label="Phone" value={formatPhoneNumber(followUp.primaryContact.primaryPhone)} />
                  ) : null}
                  {followUp.primaryContact?.primaryEmail ? (
                    <DetailRow label="Email" value={followUp.primaryContact.primaryEmail} />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">Notes</h3>
              <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {followUp.notes || "No notes added."}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  )
}
