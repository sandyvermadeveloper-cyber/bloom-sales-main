"use client"

import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"

import { followUpsApi } from "@/api/follow-ups.api"
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
  getFollowUpApiMessage,
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
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCode, formatDisplayName, formatPhoneNumber } from "@/utils/display-format"
import type { FollowUp } from "@/types/follow-up"

type FollowUpDetailDialogProps = {
  open: boolean
  followUp: FollowUp | null
  onOpenChange: (open: boolean) => void
}

export function FollowUpDetailDialog({ open, followUp, onOpenChange }: FollowUpDetailDialogProps) {
  const followUpId = followUp?.id ?? null
  const detailQuery = useQuery({
    queryKey: ["follow-ups", "detail", followUpId],
    queryFn: () => followUpsApi.detail(followUpId as string),
    enabled: open && Boolean(followUpId),
  })
  const detail = detailQuery.data?.data ?? followUp

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Follow-Up Details
            {detail?.followUpNumber ? (
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                {formatCode(detail.followUpNumber)}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {detail ? getFollowUpLeadLabel(detail) : "Follow-up information"}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading && !detail ? <FollowUpDetailSkeleton /> : null}

        {detailQuery.isError ? (
          <Alert variant="destructive">
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>{getFollowUpApiMessage(detailQuery.error, "Unable to load follow-up details.")}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => detailQuery.refetch()}>
                Retry
              </Button>
            </div>
          </Alert>
        ) : null}

        {detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {detailQuery.isLoading ? <Skeleton className="h-6 w-24" /> : null}
              <LabeledBadge label="Type" className={followUpTypeBadgeClasses[detail.type]}>
                {getFollowUpTypeLabel(detail.type, detail.customType)}
              </LabeledBadge>
              <LabeledBadge label="Status" className={followUpStatusBadgeClasses[detail.status]}>
                {getFollowUpStatusLabel(detail.status)}
              </LabeledBadge>
              {detail.outcome ? (
                <LabeledBadge label="Outcome" className={followUpOutcomeBadgeClasses[detail.outcome]}>
                  {getFollowUpOutcomeLabel(detail.outcome)}
                </LabeledBadge>
              ) : null}
              {detail.isOverdue ? (
                <LabeledBadge label="Due" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  Overdue
                </LabeledBadge>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Scheduled At" value={formatFollowUpDateTime(detail.scheduledAt)} />
              <DetailRow label="Assigned To" value={getFollowUpAssigneeName(detail)} />
              <DetailRow label="Created By" value={getFollowUpCreatedByName(detail)} />
              {detail.completedAt ? (
                <DetailRow label="Completed At" value={formatFollowUpDateTime(detail.completedAt)} />
              ) : null}
              {detail.completedBy?.name ? (
                <DetailRow label="Completed By" value={formatDisplayName(detail.completedBy.name)} />
              ) : null}
            </div>

            {detail.lead ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Lead</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{getFollowUpLeadLabel(detail)}</p>
                    {detail.lead.leadNumber ? (
                      <p className="font-mono text-xs text-muted-foreground">{formatCode(detail.lead.leadNumber)}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {detail.lead.status ? (
                      <LabeledBadge label="Lead Status" className={leadStatusBadgeClasses[detail.lead.status] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadStatusLabel(detail.lead.status)}
                      </LabeledBadge>
                    ) : null}
                    {detail.lead.priority ? (
                      <LabeledBadge label="Priority" className={leadPriorityBadgeClasses[detail.lead.priority] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadPriorityLabel(detail.lead.priority)}
                      </LabeledBadge>
                    ) : null}
                    {detail.lead.qualification ? (
                      <LabeledBadge label="Qualification" className={leadQualificationBadgeClasses[detail.lead.qualification] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadQualificationLabel(detail.lead.qualification)}
                      </LabeledBadge>
                    ) : null}
                  </div>
                  {detail.lead.expectedClosingDate ? (
                    <DetailRow label="Expected Closing" value={formatFollowUpDate(detail.lead.expectedClosingDate)} />
                  ) : null}
                </div>
              </div>
            ) : null}

            {detail.primaryContact || detail.companyName ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Contact</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detail.companyName ? <DetailRow label="Company" value={detail.companyName} /> : null}
                  {detail.primaryContact?.fullName ? (
                    <DetailRow label="Contact" value={getFollowUpContactName(detail)} />
                  ) : null}
                  {detail.primaryContact?.designation ? (
                    <DetailRow label="Designation" value={detail.primaryContact.designation} />
                  ) : null}
                  {detail.primaryContact?.primaryPhone ? (
                    <DetailRow label="Phone" value={formatPhoneNumber(detail.primaryContact.primaryPhone)} />
                  ) : null}
                  {detail.primaryContact?.primaryEmail ? (
                    <DetailRow label="Email" value={detail.primaryContact.primaryEmail} />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">Notes</h3>
              <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {detail.notes || "No notes added."}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function FollowUpDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
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

function LabeledBadge({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge
        variant="outline"
        className={cn("whitespace-nowrap font-normal px-2.5 py-0.5", className ?? "border-border bg-muted text-muted-foreground")}
      >
        {children}
      </Badge>
    </div>
  )
}
