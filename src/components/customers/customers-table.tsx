"use client"

import { Building2, Calendar, Mail, Phone } from "lucide-react"

import { CustomerActionsMenu } from "@/components/customers/customer-actions-menu"
import {
  customerPageSizeOptions,
  customerStatusBadgeClasses,
  customerTypeBadgeClasses,
} from "@/components/customers/customers.constants"
import {
  formatCustomerDate,
  getCustomerApiMessage,
  getCustomerName,
  getCustomerOwnerName,
  getCustomerPrimaryContact,
  getCustomerStatusLabel,
  getCustomerTypeLabel,
} from "@/components/customers/customers.utils"
import { TablePagination } from "@/components/shared/table-pagination"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"
import type { Customer, CustomersPagination } from "@/types/customer"
import { formatCode, formatDisplayName, formatEmail, formatPhoneNumber } from "@/utils/display-format"

type CustomersTableProps = {
  customers: Customer[]
  pagination?: CustomersPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof customerPageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof customerPageSizeOptions)[number]) => void
  onEdit: (customer: Customer) => void
  onView: (customer: Customer) => void
  onAssign: (customer: Customer) => void
  onChangeStatus: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onRestore: (customer: Customer) => void
}

export function CustomersTable({
  customers,
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
  onAssign,
  onChangeStatus,
  onDelete,
  onRestore,
}: CustomersTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getCustomerApiMessage(error, "Unable to load customers.")}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table className="min-w-[960px] lg:min-w-full">
          <TableHeader className="bg-muted/40 border-b border-border/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="min-w-[220px]">Customer Information</TableHead>
              <TableHead className="min-w-[110px]">Type</TableHead>
              <TableHead className="min-w-[200px]">Contact Details</TableHead>
              <TableHead className="min-w-[120px]">Owner</TableHead>
              <TableHead className="min-w-[110px]">Status</TableHead>
              <TableHead className="min-w-[110px]">Created</TableHead>
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

            {!isLoading && customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Building2 className="size-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No customers found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting your filters or create a new customer
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? customers.map((customer, index) => {
                  const contact = getCustomerPrimaryContact(customer)

                  return (
                    <TableRow
                      key={customer.id}
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

                      {/* Customer Info */}
                      <TableCell className="align-middle">
                        <div className="space-y-1">
                          <TooltipProvider delayDuration={800}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="line-clamp-2 cursor-help text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                  {getCustomerName(customer).length > 24
                                    ? `${getCustomerName(customer).slice(0, 24)}...`
                                    : getCustomerName(customer)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm whitespace-normal text-left">
                                {getCustomerName(customer)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="font-mono text-xs text-muted-foreground">
                            {formatCode(customer.customerNumber || customer.id)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap font-normal px-2.5 py-0.5",
                            customerTypeBadgeClasses[customer.customerType ?? ""] ??
                              "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {getCustomerTypeLabel(customer.customerType)}
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
                              <TooltipContent>{formatEmail(contact?.primaryEmail)}</TooltipContent>
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
                          <span className="text-sm text-muted-foreground truncate">
                            {getCustomerOwnerName(customer)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap font-normal px-2.5 py-0.5 capitalize",
                            customerStatusBadgeClasses[customer.status ?? ""] ??
                              "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {getCustomerStatusLabel(customer.status)}
                        </Badge>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatCustomerDate(customer.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-middle text-center">
                        <CustomerActionsMenu
                          customer={customer}
                          onEdit={onEdit}
                          onView={onView}
                          onAssign={onAssign}
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
        pageSizeOptions={customerPageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof customerPageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
