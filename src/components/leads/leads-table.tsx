"use client"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TablePagination } from "@/components/shared/table-pagination"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LeadActionsMenu } from "@/components/leads/lead-actions-menu"
import {
  leadPageSizeOptions,
  leadQualificationBadgeClasses,
  leadPriorityBadgeClasses,
  leadStatusBadgeClasses,
} from "@/components/leads/leads.constants"
import {
  formatLeadDate,
  getLeadApiMessage,
  getLeadOwnerName,
  getLeadPrimaryContact,
  getLeadPriorityLabel,
  getLeadQualificationLabel,
  getLeadSourceName,
  getLeadStatusLabel,
  getLeadTitle,
} from "@/components/leads/leads.utils"
import { cn } from "@/lib/utils"
import type { Lead, LeadsPagination } from "@/types/lead"
import { Calendar, Clock, Inbox, Mail, Phone } from "lucide-react"
import { formatCode, formatDisplayName, formatEmail, formatPhoneNumber } from "@/utils/display-format"

type LeadsTableProps = {
  leads: Lead[]
  pagination?: LeadsPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof leadPageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof leadPageSizeOptions)[number]) => void
  onEdit: (lead: Lead) => void
  onView: (lead: Lead) => void
  onChangeStatus: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onRestore: (lead: Lead) => void
}

export function LeadsTable({
  leads,
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
  onEdit,
  onView,
  onChangeStatus,
  onDelete,
  onRestore,
}: LeadsTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getLeadApiMessage(error, "Unable to load leads.")}</span>
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
        <TableHead className="w-12 text-center ">
          #
        </TableHead>
        <TableHead className="min-w-[220px] ">
          Lead Information
        </TableHead>
        <TableHead className="min-w-[120px] ">
          Source
        </TableHead>
        <TableHead className="min-w-[200px] ">
          Contact Details
        </TableHead>
        <TableHead className="min-w-[120px] ">
          Owner
        </TableHead>
        <TableHead className="min-w-[100px] ">
          Priority
        </TableHead>
        <TableHead className="min-w-[110px] ">
          Qualification
        </TableHead>
        <TableHead className="min-w-[110px] ">
          Status
        </TableHead>
        <TableHead className="min-w-[110px] ">
          Expected Date
        </TableHead>
        <TableHead className="min-w-[110px] ">
          Created
        </TableHead>
        <TableHead className="w-20 text-center ">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-b border-border/40">
              {Array.from({ length: 11 }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        : null}

      {!isLoading && leads.length === 0 ? (
        <TableRow>
          <TableCell colSpan={11} className="h-64 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="rounded-full bg-muted/50 p-4">
                <Inbox className="size-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No leads found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or create a new lead</p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}

      {!isLoading
        ? leads.map((lead, index) => {
            const contact = getLeadPrimaryContact(lead)

            return (
              <TableRow
                key={lead.id}
                className="group odd:bg-background even:bg-muted/20 hover:bg-primary/5"
              >
                {/* Serial Number */}
                <TableCell className="align-middle">
                  <div className="flex justify-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/10 group-hover:ring-primary/20">
                      {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1}
                    </span>
                  </div>
                </TableCell>

                {/* Lead Info */}
                <TableCell className="align-middle">
                  <div className="space-y-1">
                    <TooltipProvider delayDuration={800}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 cursor-help text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {/* {getLeadTitle(lead)} */}
                          {getLeadTitle(lead).length > 20
                          ? `${getLeadTitle(lead).slice(0, 20)}...`
                          : getLeadTitle(lead)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-normal text-left">
                        {getLeadTitle(lead)}
                      </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatCode(lead.leadNumber || lead.id)}
                    </p>
                  </div>
                </TableCell>

                {/* Source */}
                <TableCell className="align-middle">
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/5 text-primary border-primary/15 font-normal hover:bg-primary/10 transition-colors"
                  >
                    {getLeadSourceName(lead)}
                  </Badge>
                </TableCell>

                {/* Contact */}
                <TableCell className="align-middle">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                      {formatDisplayName(contact?.fullName)}
                    </p>
                    <TooltipProvider delayDuration={700}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="flex max-w-[180px] cursor-help items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="size-3 shrink-0" />
            {formatEmail(contact?.primaryEmail)}
          </p>
        </TooltipTrigger>

        <TooltipContent>
          {formatEmail(contact?.primaryEmail)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px] flex items-center gap-1">
                      <Phone className="size-3 shrink-0" />
                      {formatPhoneNumber(contact?.primaryPhone)}
                    </p>
                  </div>
                </TableCell>

                {/* Owner */}
                <TableCell className="align-middle">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground truncate ">
                      {getLeadOwnerName(lead)}
                    </span>
                  </div>
                </TableCell>

                {/* Priority */}
                <TableCell className="align-middle texce">
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap font-normal px-2.5 py-0.5",
                      leadPriorityBadgeClasses[lead.priority ?? ""] ??
                        "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {getLeadPriorityLabel(lead.priority)}
                    </span>
                  </Badge>
                </TableCell>

                {/* Qualification */}
                <TableCell className="align-middle">
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap font-normal px-2.5 py-0.5",
                      leadQualificationBadgeClasses[lead.qualification ?? ""] ??
                        "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {getLeadQualificationLabel(lead.qualification)}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell className="align-middle">
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap font-normal px-2.5 py-0.5 capitalize",
                      leadStatusBadgeClasses[lead.status ?? ""] ??
                        "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {getLeadStatusLabel(lead.status)}
                  </Badge>
                </TableCell>

                {/* Expected Closing Date */}
                <TableCell className="align-middle">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatLeadDate(lead.expectedClosingDate)}
                    </span>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="align-middle">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatLeadDate(lead.createdAt)}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="align-middle text-center">
                  <LeadActionsMenu
                    lead={lead}
                    onEdit={onEdit}
                    onView={onView}
                    onChangeStatus={onChangeStatus}
                    onDelete={onDelete}
                    onRestore={onRestore}
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
        pageSizeOptions={leadPageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof leadPageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
