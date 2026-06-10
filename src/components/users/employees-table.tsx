"use client"

import { Alert } from "@/components/ui/alert"
import { RoleBadge } from "@/components/shared/role-badge"
import { StatusBadge } from "@/components/shared/status-badge"
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
import { EmployeeActionsMenu } from "@/components/users/employee-actions-menu"
import { pageSizeOptions } from "@/components/users/users.constants"
import {
  formatDate,
  getApiMessage,
  getEmployeeName,
} from "@/components/users/users.utils"
import type { AdminProfile } from "@/types/auth"
import type { Employee, EmployeesPagination } from "@/types/employee"
import { formatCode, formatEmail, formatPhoneNumber } from "@/utils/display-format"

type EmployeesTableProps = {
  employees: Employee[]
  pagination?: EmployeesPagination
  currentEmployee: AdminProfile | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  limit: (typeof pageSizeOptions)[number]
  onLimitChange: (value: (typeof pageSizeOptions)[number]) => void
  onEditProfile: (employee: Employee) => void
  onResendInvite: (employee: Employee) => void
  onChangeRole: (employee: Employee) => void
  onChangeStatus: (employee: Employee) => void
}

export function EmployeesTable({
  employees,
  pagination,
  currentEmployee,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  onPageChange,
  onPreviousPage,
  onNextPage,
  limit,
  onLimitChange,
  onEditProfile,
  onResendInvite,
  onChangeRole,
  onChangeStatus,
}: EmployeesTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getApiMessage(error, "Unable to load employees.")}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
  <Table>
    <TableHeader className="bg-primary/5">
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-16 text-center">#</TableHead>
        <TableHead>Employee</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Updated</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 8 }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        : null}

      {!isLoading && employees.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={8}
            className="h-24 text-center text-muted-foreground"
          >
            No employees found.
          </TableCell>
        </TableRow>
      ) : null}

      {!isLoading
        ? employees.map((employee, index) => (
            <TableRow
              key={employee.id}
              className="
                group
                odd:bg-background
                even:bg-muted/20
                hover:bg-primary/5
                transition-colors
              "
            >
              {/* SL NO */}
              <TableCell className="align-middle">
                <div className="flex justify-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/10 group-hover:ring-primary/20">
                    {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1}
                  </span>
                </div>
              </TableCell>

              {/* Employee */}
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {getEmployeeName(employee)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatCode(employee.employeeCode)}
                  </p>
                </div>
              </TableCell>

              {/* Email */}
              <TableCell>
                <span className="font-medium text-info">
                  {formatEmail(employee.email)}
                </span>
              </TableCell>

              {/* Phone */}
              <TableCell>
                <span className="text-muted-foreground">
                  {formatPhoneNumber(employee.phone)}
                </span>
              </TableCell>

              {/* Role */}
              <TableCell>
                <RoleBadge role={employee.role} />
              </TableCell>

                {/* Status */}
              <TableCell>
                <StatusBadge status={employee.status} />
              </TableCell>

              {/* Updated */}
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(employee.updatedAt || employee.createdAt)}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <EmployeeActionsMenu
                  employee={employee}
                  currentEmployee={currentEmployee}
                  onEditProfile={onEditProfile}
                  onResendInvite={onResendInvite}
                  onChangeRole={onChangeRole}
                  onChangeStatus={onChangeStatus}
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
        pageSizeOptions={pageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof pageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
