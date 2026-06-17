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
import { ServiceActionsMenu } from "@/components/services/service-actions-menu"
import { servicePageSizeOptions } from "@/components/services/services.constants"
import {
  formatServiceDate,
  getServiceApiMessage,
  getServiceDescription,
  getServiceName,
} from "@/components/services/services.utils"
import type { Service, ServicesPagination } from "@/types/service"
import { Inbox } from "lucide-react"

type ServicesTableProps = {
  services: Service[]
  pagination?: ServicesPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof servicePageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof servicePageSizeOptions)[number]) => void
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onRestore: (service: Service) => void
}

export function ServicesTable({
  services,
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
}: ServicesTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getServiceApiMessage(error, "Unable to load services.")}</span>
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
              <TableHead className="w-[28%]">Service</TableHead>
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

            {!isLoading && services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Inbox className="size-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No Services found</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? services.map((service, index) => (
                  <TableRow
                    key={service.id}
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
                        <p className="truncate font-semibold text-foreground">{getServiceName(service)}</p>
                        {service.slug ? (
                          <p className="truncate text-xs text-muted-foreground">{service.slug}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="cursor-help text-sm text-muted-foreground">
                            {getServiceDescription(service).length > 20
                              ? `${getServiceDescription(service).slice(0, 20)}...`
                              : getServiceDescription(service)}
                          </p>
                        </TooltipTrigger>

                        <TooltipContent className="max-w-sm whitespace-normal text-left leading-relaxed">
                          {getServiceDescription(service)}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatServiceDate(service.updatedAt || service.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <ServiceActionsMenu
                        service={service}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onRestore={onRestore}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        limit={limit}
        pageSizeOptions={servicePageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof servicePageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
