"use client"

import { CalendarClock, Inbox, Mail, Phone } from "lucide-react"

import { FollowUpActionsMenu } from "@/components/follow-ups/follow-up-actions-menu"
import {
  followUpOutcomeBadgeClasses,
  followUpPageSizeOptions,
  followUpStatusBadgeClasses,
  followUpTypeBadgeClasses,
} from "@/components/follow-ups/follow-ups.constants"
import {
  formatFollowUpDateTime,
  getFollowUpApiMessage,
  getFollowUpAssigneeName,
  getFollowUpContactName,
  getFollowUpLeadLabel,
  getFollowUpOutcomeLabel,
  getFollowUpStatusLabel,
  getFollowUpTypeLabel,
} from "@/components/follow-ups/follow-ups.utils"
import {
  leadPriorityBadgeClasses,
  leadQualificationBadgeClasses,
} from "@/components/leads/leads.constants"
import { getLeadPriorityLabel, getLeadQualificationLabel } from "@/components/leads/leads.utils"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/shared/table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCode, formatEmail, formatPhoneNumber } from "@/utils/display-format"
import type { FollowUp, FollowUpsPagination } from "@/types/follow-up"

type FollowUpsTableProps = {
  followUps: FollowUp[]
  pagination?: FollowUpsPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof followUpPageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof followUpPageSizeOptions)[number]) => void
  onView: (followUp: FollowUp) => void
  onEdit: (followUp: FollowUp) => void
  onAssign: (followUp: FollowUp) => void
  onComplete: (followUp: FollowUp) => void
  onReschedule: (followUp: FollowUp) => void
  onCancel: (followUp: FollowUp) => void
  onReopen: (followUp: FollowUp) => void
  onMarkMissed: (followUp: FollowUp) => void
}

export function FollowUpsTable({
  followUps,
  pagination,
  isLoading,
  isFetching,
  isError,
  error,
  limit,
  onRetry,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onLimitChange,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onReschedule,
  onCancel,
  onReopen,
  onMarkMissed,
}: FollowUpsTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getFollowUpApiMessage(error, "Unable to load follow-ups.")}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table className="min-w-[1024px] lg:min-w-full">
          <TableHeader className="bg-muted/40 border-b border-border/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="min-w-[220px]">Lead</TableHead>
              <TableHead className="min-w-[140px]">Type</TableHead>
              <TableHead className="min-w-[110px]">Status</TableHead>
              <TableHead className="min-w-[160px]">Scheduled At</TableHead>
              <TableHead className="min-w-[140px]">Assigned To</TableHead>
              <TableHead className="min-w-[200px]">Contact</TableHead>
              <TableHead className="w-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-border/40">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading && followUps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Inbox className="size-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No follow-ups found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try adjusting your filters or schedule a new follow-up
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? followUps.map((followUp, index) => {
                  const leadLabel = getFollowUpLeadLabel(followUp)

                  return (
                    <TableRow
                      key={followUp.id}
                      className="group odd:bg-background even:bg-muted/20 hover:bg-primary/5"
                    >
                      <TableCell className="align-middle">
                        <div className="flex justify-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/10 group-hover:ring-primary/20">
                            {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="align-middle">
                        <div className="space-y-1.5">
                          <TooltipProvider delayDuration={800}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="line-clamp-2 cursor-help text-sm font-semibold text-foreground transition-colors ">
                                  {leadLabel.length > 28 ? `${leadLabel.slice(0, 28)}...` : leadLabel}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm whitespace-normal text-left">
                                {leadLabel}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {followUp.followUpNumber ? (
                              <span className="font-mono">{formatCode(followUp.followUpNumber)}</span>
                            ) : null}
                            {followUp.followUpNumber && followUp.lead?.leadNumber ? <span>·</span> : null}
                            {followUp.lead?.leadNumber ? (
                              <span className="font-mono">{formatCode(followUp.lead.leadNumber)}</span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {followUp.lead?.priority ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "whitespace-nowrap px-1.5 py-0 text-[10px] font-normal",
                                  leadPriorityBadgeClasses[followUp.lead.priority] ?? "border-border bg-muted text-muted-foreground"
                                )}
                              >
                                {getLeadPriorityLabel(followUp.lead.priority)}
                              </Badge>
                            ) : null}
                            {followUp.lead?.qualification ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "whitespace-nowrap px-1.5 py-0 text-[10px] font-normal",
                                  leadQualificationBadgeClasses[followUp.lead.qualification] ?? "border-border bg-muted text-muted-foreground"
                                )}
                              >
                                {getLeadQualificationLabel(followUp.lead.qualification)}
                              </Badge>
                            ) : null}
                            {followUp.isOverdue ? (
                              <Badge
                                variant="outline"
                                className="whitespace-nowrap px-1.5 py-0 text-[10px] font-normal border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                              >
                                Overdue
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap font-normal px-2.5 py-0.5",
                            followUpTypeBadgeClasses[followUp.type] ?? "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {getFollowUpTypeLabel(followUp.type, followUp.customType)}
                        </Badge>
                      </TableCell>

                      <TableCell className="align-middle">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "whitespace-nowrap font-normal px-2.5 py-0.5",
                              followUpStatusBadgeClasses[followUp.status] ?? "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            {getFollowUpStatusLabel(followUp.status)}
                          </Badge>
                          {followUp.outcome ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "whitespace-nowrap font-normal px-2.5 py-0.5",
                                followUpOutcomeBadgeClasses[followUp.outcome] ?? "border-border bg-muted text-muted-foreground"
                              )}
                            >
                              {getFollowUpOutcomeLabel(followUp.outcome)}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className="size-3 text-muted-foreground" />
                          <span className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatFollowUpDateTime(followUp.scheduledAt)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="align-middle">
                        <span className="truncate text-sm text-muted-foreground">
                          {getFollowUpAssigneeName(followUp)}
                        </span>
                      </TableCell>

                      <TableCell className="align-middle">
                        <div className="space-y-0.5">
                          <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
                            {getFollowUpContactName(followUp)}
                          </p>
                          {followUp.primaryContact?.primaryEmail ? (
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="flex max-w-[180px] cursor-pointer items-center gap-1 truncate text-xs text-muted-foreground">
                                  <Mail className="size-3 shrink-0" />
                                  {formatEmail(followUp.primaryContact.primaryEmail)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{followUp.primaryContact.primaryEmail}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                          {followUp.primaryContact?.primaryPhone ? (
                            <p className="flex max-w-[180px] items-center gap-1 truncate text-xs text-muted-foreground">
                              <Phone className="size-3 shrink-0" />
                              {formatPhoneNumber(followUp.primaryContact.primaryPhone)}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="align-middle text-center">
                        <FollowUpActionsMenu
                          followUp={followUp}
                          onView={onView}
                          onEdit={onEdit}
                          onAssign={onAssign}
                          onComplete={onComplete}
                          onReschedule={onReschedule}
                          onCancel={onCancel}
                          onReopen={onReopen}
                          onMarkMissed={onMarkMissed}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              : null}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        limit={limit}
        pageSizeOptions={followUpPageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof followUpPageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
