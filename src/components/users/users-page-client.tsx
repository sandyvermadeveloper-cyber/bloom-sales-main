"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { adminEmployeesApi } from "@/api/employees.api"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmployeeInviteDialog } from "@/components/users/employee-invite-dialog"
import { EmployeeProfileDialog } from "@/components/users/employee-profile-dialog"
import { EmployeeRoleDialog } from "@/components/users/employee-role-dialog"
import { EmployeeStatusDialog } from "@/components/users/employee-status-dialog"
import { EmployeesFilters } from "@/components/users/employees-filters"
import { EmployeesTable } from "@/components/users/employees-table"
import { defaultPageSize, pageSizeOptions } from "@/components/users/users.constants"
import {
  getApiMessage,
  normalizeSearch,
  parseLimit,
  parsePage,
  parseRole,
  parseStatus,
} from "@/components/users/users.utils"
import type {
  EmployeeInviteFormValues,
  EmployeeProfileFormValues,
  EmployeeRoleFormValues,
  EmployeeStatusFormValues,
} from "@/schemas/employee.schemas"
import { useAuthStore } from "@/stores/auth.store"
import type { AdminRole } from "@/types/auth"
import type {
  Employee,
  EmployeeInviteData,
  EmployeeStatus,
  ListEmployeesQuery,
} from "@/types/employee"

function UsersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()
  const currentEmployee = useAuthStore((state) => state.employee)
  const [page, setPage] = useState(() => parsePage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof pageSizeOptions)[number]>(() => parseLimit(searchParams.get("limit")))
  const [searchDraft, setSearchDraft] = useState(() => normalizeSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeSearch(searchParams.get("search")))
  const [status, setStatus] = useState<EmployeeStatus | "all">(() => parseStatus(searchParams.get("status")))
  const [role, setRole] = useState<AdminRole | "all">(() => parseRole(searchParams.get("role")))
  const [createOpen, setCreateOpen] = useState(false)
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null)
  const [resendEmployee, setResendEmployee] = useState<Employee | null>(null)
  const [roleEmployee, setRoleEmployee] = useState<Employee | null>(null)
  const [statusEmployee, setStatusEmployee] = useState<Employee | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<EmployeeInviteData | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultPageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)
    if (status !== "all") params.set("status", status)
    if (role !== "all") params.set("role", role)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, role, router, search, searchParamsString, status])

  const query: ListEmployeesQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      role: role === "all" ? undefined : role,
    }),
    [limit, page, role, search, status]
  )

  const employeesQuery = useQuery({
    queryKey: ["admin-employees", query],
    queryFn: () => adminEmployeesApi.list(query),
    placeholderData: keepPreviousData,
  })

  const employees = employeesQuery.data?.data.employees ?? []
  const pagination = employeesQuery.data?.data.pagination

  const invalidateEmployees = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-employees"] })
  }

  const createMutation = useMutation({
    mutationFn: (values: EmployeeInviteFormValues) => adminEmployeesApi.invite(values),
    onSuccess: (response) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setInviteResult(null)
      setPageMessage(response.message)
      invalidateEmployees()
    },
    onError: (error) => {
      setInviteResult(null)
      setDialogMessage(getApiMessage(error, "Unable to invite employee. Please try again."))
    },
  })

  const resendMutation = useMutation({
    mutationFn: (values: EmployeeInviteFormValues) => {
      if (!resendEmployee) {
        throw new Error("Employee is required to resend invite.")
      }

      return adminEmployeesApi.resendInvite(resendEmployee.id, values)
    },
    onSuccess: (response) => {
      setResendEmployee(null)
      setDialogMessage(null)
      setInviteResult(null)
      setPageMessage(response.message)
      invalidateEmployees()
    },
    onError: (error) => {
      setInviteResult(null)
      setDialogMessage(getApiMessage(error, "Unable to resend invite. Please try again."))
    },
  })

  const profileMutation = useMutation({
    mutationFn: (values: EmployeeProfileFormValues) => {
      if (!profileEmployee) {
        throw new Error("Employee is required to update profile.")
      }

      return adminEmployeesApi.updateProfile(profileEmployee.id, values)
    },
    onSuccess: (response) => {
      setProfileEmployee(null)
      setDialogMessage(null)
      setInviteResult(null)
      setPageMessage(response.message)
      invalidateEmployees()
    },
    onError: (error) => {
      setDialogMessage(getApiMessage(error, "Unable to update employee profile. Please try again."))
    },
  })

  const roleMutation = useMutation({
    mutationFn: (values: EmployeeRoleFormValues) => {
      if (!roleEmployee) {
        throw new Error("Employee is required to update role.")
      }

      return adminEmployeesApi.updateRole(roleEmployee.id, values)
    },
    onSuccess: (response) => {
      setRoleEmployee(null)
      setDialogMessage(null)
      setInviteResult(null)
      setPageMessage(response.message)
      invalidateEmployees()
    },
    onError: (error) => {
      setDialogMessage(getApiMessage(error, "Unable to update employee role. Please try again."))
    },
  })

  const statusMutation = useMutation({
    mutationFn: (values: EmployeeStatusFormValues) => {
      if (!statusEmployee) {
        throw new Error("Employee is required to update status.")
      }

      return adminEmployeesApi.updateStatus(statusEmployee.id, values)
    },
    onSuccess: (response) => {
      setStatusEmployee(null)
      setDialogMessage(null)
      setInviteResult(null)
      setPageMessage(response.message)
      invalidateEmployees()
    },
    onError: (error) => {
      setDialogMessage(getApiMessage(error, "Unable to update employee status. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultPageSize)
    setSearch("")
    setSearchDraft("")
    setStatus("all")
    setRole("all")
  }

  const resetDialogState = () => {
    setDialogMessage(null)
    setInviteResult(null)
    setPageMessage(null)
  }

  const openCreateDialog = () => {
    createMutation.reset()
    resetDialogState()
    setCreateOpen(true)
  }

  const openProfileDialog = (employee: Employee) => {
    profileMutation.reset()
    resetDialogState()
    setProfileEmployee(employee)
  }

  const openResendDialog = (employee: Employee) => {
    resendMutation.reset()
    resetDialogState()
    setResendEmployee(employee)
  }

  const openRoleDialog = (employee: Employee) => {
    roleMutation.reset()
    resetDialogState()
    setRoleEmployee(employee)
  }

  const openStatusDialog = (employee: Employee) => {
    statusMutation.reset()
    resetDialogState()
    setStatusEmployee(employee)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) {
      setDialogMessage(null)
      setInviteResult(null)
    }
  }

  const closeProfileDialog = (open: boolean) => {
    if (open || profileMutation.isPending) return
    setProfileEmployee(null)
    setDialogMessage(null)
    setInviteResult(null)
  }

  const closeResendDialog = (open: boolean) => {
    if (open || resendMutation.isPending) return
    setResendEmployee(null)
    setDialogMessage(null)
    setInviteResult(null)
  }

  const closeRoleDialog = (open: boolean) => {
    if (open || roleMutation.isPending) return
    setRoleEmployee(null)
    setDialogMessage(null)
    setInviteResult(null)
  }

  const closeStatusDialog = (open: boolean) => {
    if (open || statusMutation.isPending) return
    setStatusEmployee(null)
    setDialogMessage(null)
    setInviteResult(null)
  }

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage employees, invitations, roles, and account status.
          </p>
        </div>
        <Button onClick={openCreateDialog} className=" h-10">
          <UserPlus className="size-4" />
          Add employee
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Employees</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} employees - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <div className="space-y-2">
                <p>{pageMessage}</p>
              </div>
            </Alert>
          ) : null}

          <EmployeesFilters
            searchDraft={searchDraft}
            status={status}
            role={role}
            onSearchDraftChange={setSearchDraft}
            onStatusChange={(nextStatus) => {
              setPage(1)
              setStatus(nextStatus)
            }}
            onRoleChange={(nextRole) => {
              setPage(1)
              setRole(nextRole)
            }}
            onReset={resetFilters}
          />

          <EmployeesTable
            employees={employees}
            pagination={pagination}
            currentEmployee={currentEmployee}
            isLoading={employeesQuery.isLoading}
            isFetching={employeesQuery.isFetching}
            isError={employeesQuery.isError}
            error={employeesQuery.error}
            onRetry={() => employeesQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            limit={limit}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onEditProfile={openProfileDialog}
            onResendInvite={openResendDialog}
            onChangeRole={openRoleDialog}
            onChangeStatus={openStatusDialog}
          />
        </CardContent>
      </Card>

      <EmployeeInviteDialog
        mode="create"
        open={createOpen}
        isPending={createMutation.isPending}
        error={createMutation.error}
        message={dialogMessage}
        inviteResult={inviteResult}
        currentEmployeeRole={currentEmployee?.role}
        onOpenChange={closeCreateDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          setInviteResult(null)
          createMutation.mutate(values)
        }}
      />

      <EmployeeProfileDialog
        open={Boolean(profileEmployee)}
        employee={profileEmployee}
        isPending={profileMutation.isPending}
        error={profileMutation.error}
        message={dialogMessage}
        onOpenChange={closeProfileDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          setInviteResult(null)
          profileMutation.mutate(values)
        }}
      />

      <EmployeeInviteDialog
        mode="resend"
        open={Boolean(resendEmployee)}
        employee={resendEmployee}
        isPending={resendMutation.isPending}
        error={resendMutation.error}
        message={dialogMessage}
        inviteResult={inviteResult}
        onOpenChange={closeResendDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          setInviteResult(null)
          resendMutation.mutate(values)
        }}
      />

      <EmployeeRoleDialog
        open={Boolean(roleEmployee)}
        employee={roleEmployee}
        isPending={roleMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeRoleDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          setInviteResult(null)
          roleMutation.mutate(values)
        }}
      />

      <EmployeeStatusDialog
        open={Boolean(statusEmployee)}
        employee={statusEmployee}
        isPending={statusMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeStatusDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          setInviteResult(null)
          statusMutation.mutate(values)
        }}
      />
    </section>
  )
}

export function UsersPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <UsersPageContent />
    </Suspense>
  )
}
