"use client"

import { Alert } from "@/components/ui/alert"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LeadSourceActionsMenu } from "@/components/lead-sources/lead-source-actions-menu"
import { leadSourcePageSizeOptions } from "@/components/lead-sources/lead-sources.constants"
import {
  formatLeadSourceDate,
  getLeadSourceApiMessage,
  getLeadSourceDescription,
  getLeadSourceName,
} from "@/components/lead-sources/lead-sources.utils"
import type { LeadSource, LeadSourcesPagination } from "@/types/lead-source"
import { Inbox } from "lucide-react"

type LeadSourcesTableProps = {
  leadSources: LeadSource[]
  pagination?: LeadSourcesPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof leadSourcePageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof leadSourcePageSizeOptions)[number]) => void
  onEdit: (leadSource: LeadSource) => void
  onDelete: (leadSource: LeadSource) => void
  onRestore: (leadSource: LeadSource) => void
}

export function LeadSourcesTable({
  leadSources,
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
  onDelete,
  onRestore,
}: LeadSourcesTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getLeadSourceApiMessage(error, "Unable to load lead sources.")}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table className="">
          <TableHeader className="bg-primary/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead className="w-[28%]">Lead Source</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32">Updated</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading && leadSources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Inbox className="size-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No Lead Sources found</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? leadSources.map((leadSource, index) => {
                  const description = getLeadSourceDescription(leadSource)

                  return (
                    <TableRow
                      key={leadSource.id}
                      className="group odd:bg-background even:bg-muted/20 hover:bg-primary/5"
                    >
                      <TableCell className="align-middle">
                        <div className="flex justify-center">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/10 group-hover:ring-primary/20">
                            {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <div className="space-y-1">
                          <p className="truncate font-semibold text-foreground">
                            {getLeadSourceName(leadSource)}
                          </p>
                          {leadSource.slug ? (
                            <p className="truncate text-xs text-muted-foreground">{leadSource.slug}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="line-clamp-2 cursor-help text-sm leading-5 text-muted-foreground">
                              {description.length > 20
          ? `${description.slice(0, 20)}...`
          : description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm whitespace-normal text-left leading-relaxed">
                            {description}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatLeadSourceDate(leadSource.updatedAt || leadSource.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <LeadSourceActionsMenu
                          leadSource={leadSource}
                          onEdit={onEdit}
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
        pageSizeOptions={leadSourcePageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof leadSourcePageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
