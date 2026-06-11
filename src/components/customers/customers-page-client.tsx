"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { customersApi } from "@/api/customers.api"
import { CustomerAssignDialog } from "@/components/customers/customer-assign-dialog"
import { CustomerConfirmDialog } from "@/components/customers/customer-confirm-dialog"
import { CustomerDetailDialog } from "@/components/customers/customer-detail-dialog"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { CustomerEditDialog } from "@/components/customers/customer-edit-dialog"
import { CustomerStatusDialog } from "@/components/customers/customer-status-dialog"
import { defaultCustomerPageSize, customerPageSizeOptions } from "@/components/customers/customers.constants"
import { CustomersFilters } from "@/components/customers/customers-filters"
import { CustomersTable } from "@/components/customers/customers-table"
import {
  customerFormToCreateInput,
  customerFormToUpdateInput,
  getCustomerApiMessage,
  normalizeCustomerSearch,
  parseCustomerLimit,
  parseCustomerPage,
  parseCustomerStatus,
} from "@/components/customers/customers.utils"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  CustomerAssignFormValues,
  CustomerFormValues,
  CustomerStatusChangeFormValues,
  CustomerUpdateFormValues,
} from "@/schemas/customer.schemas"
import type { Customer, CustomerStatus, ListCustomersQuery } from "@/types/customer"

function CustomersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(() => parseCustomerPage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof customerPageSizeOptions)[number]>(() =>
    parseCustomerLimit(searchParams.get("limit"))
  )
  const [searchDraft, setSearchDraft] = useState(() => normalizeCustomerSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeCustomerSearch(searchParams.get("search")))
  const [status, setStatus] = useState<CustomerStatus | "all">(() => parseCustomerStatus(searchParams.get("status")))
  const [createOpen, setCreateOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [assignCustomer, setAssignCustomer] = useState<Customer | null>(null)
  const [statusCustomer, setStatusCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [restoreCustomer, setRestoreCustomer] = useState<Customer | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeCustomerSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultCustomerPageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)
    if (status !== "all") params.set("status", status)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, router, search, searchParamsString, status])

  const query: ListCustomersQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
    }),
    [limit, page, search, status]
  )

  const customersQuery = useQuery({
    queryKey: ["customers", query],
    queryFn: () => customersApi.list(query),
    placeholderData: keepPreviousData,
  })

  const customers = customersQuery.data?.data.customers ?? []
  const pagination = customersQuery.data?.data.pagination

  const invalidateCustomers = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers"] })
  }

  const createMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const response = await customersApi.create(customerFormToCreateInput(values))
      const customerId = response.data.id

      if (!values.existingContactIds.length) {
        return { response, attachWarning: null }
      }

      const attachResults = await Promise.allSettled(
        values.existingContactIds.map((contactId, index) =>
          customersApi.addContact(customerId, {
            contactId,
            isPrimary: values.newContacts.length === 0 && index === 0,
          })
        )
      )
      const failedAttachCount = attachResults.filter((result) => result.status === "rejected").length

      return {
        response,
        attachWarning:
          failedAttachCount > 0
            ? `Customer created, but ${failedAttachCount} existing contact link failed. Please open the customer and retry.`
            : null,
      }
    },
    onSuccess: ({ response, attachWarning }) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setPageMessage(attachWarning ?? response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to create customer. Please try again."))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: CustomerUpdateFormValues) => {
      if (!editCustomer) throw new Error("Customer is required to update.")

      return customersApi.update(editCustomer.id, customerFormToUpdateInput(values))
    },
    onSuccess: (response) => {
      setEditCustomer(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to update customer. Please try again."))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!deleteCustomer) throw new Error("Customer is required to delete.")

      return customersApi.delete(deleteCustomer.id)
    },
    onSuccess: (response) => {
      setDeleteCustomer(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to delete customer. Please try again."))
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!restoreCustomer) throw new Error("Customer is required to restore.")

      return customersApi.restore(restoreCustomer.id)
    },
    onSuccess: (response) => {
      setRestoreCustomer(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to restore customer. Please try again."))
    },
  })

  const statusMutation = useMutation({
    mutationFn: (values: CustomerStatusChangeFormValues) => {
      if (!statusCustomer) throw new Error("Customer is required to change status.")

      return customersApi.changeStatus(statusCustomer.id, values)
    },
    onSuccess: (response) => {
      setStatusCustomer(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to change customer status. Please try again."))
    },
  })

  const assignMutation = useMutation({
    mutationFn: (values: CustomerAssignFormValues) => {
      if (!assignCustomer) throw new Error("Customer is required to assign.")

      return customersApi.assign(assignCustomer.id, values)
    },
    onSuccess: (response) => {
      setAssignCustomer(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getCustomerApiMessage(error, "Unable to assign customer. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultCustomerPageSize)
    setSearch("")
    setSearchDraft("")
    setStatus("all")
  }

  const resetDialogState = () => {
    setDialogMessage(null)
    setPageMessage(null)
  }

  const openCreateDialog = () => {
    createMutation.reset()
    resetDialogState()
    setCreateOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    updateMutation.reset()
    resetDialogState()
    setEditCustomer(customer)
  }

  const openViewDialog = (customer: Customer) => {
    resetDialogState()
    setViewCustomer(customer)
  }

  const openAssignDialog = (customer: Customer) => {
    assignMutation.reset()
    resetDialogState()
    setAssignCustomer(customer)
  }

  const openStatusDialog = (customer: Customer) => {
    statusMutation.reset()
    resetDialogState()
    setStatusCustomer(customer)
  }

  const openDeleteDialog = (customer: Customer) => {
    deleteMutation.reset()
    resetDialogState()
    setDeleteCustomer(customer)
  }

  const openRestoreDialog = (customer: Customer) => {
    restoreMutation.reset()
    resetDialogState()
    setRestoreCustomer(customer)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) setDialogMessage(null)
  }

  const closeEditDialog = (open: boolean) => {
    if (open || updateMutation.isPending) return
    setEditCustomer(null)
    setDialogMessage(null)
  }

  const closeAssignDialog = (open: boolean) => {
    if (open || assignMutation.isPending) return
    setAssignCustomer(null)
    setDialogMessage(null)
  }

  const closeStatusDialog = (open: boolean) => {
    if (open || statusMutation.isPending) return
    setStatusCustomer(null)
    setDialogMessage(null)
  }

  const closeDeleteDialog = (open: boolean) => {
    if (open || deleteMutation.isPending) return
    setDeleteCustomer(null)
    setDialogMessage(null)
  }

  const closeRestoreDialog = (open: boolean) => {
    if (open || restoreMutation.isPending) return
    setRestoreCustomer(null)
    setDialogMessage(null)
  }

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer accounts, ownership, contacts, and account status.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="h-10">
          <Building2 className="size-4" />
          Add customer
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Customers</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} customers - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <CustomersFilters
            searchDraft={searchDraft}
            status={status}
            onSearchDraftChange={setSearchDraft}
            onStatusChange={(nextStatus) => {
              setPage(1)
              setStatus(nextStatus)
            }}
            onReset={resetFilters}
          />

          <CustomersTable
            customers={customers}
            pagination={pagination}
            isLoading={customersQuery.isLoading}
            isFetching={customersQuery.isFetching}
            isError={customersQuery.isError}
            error={customersQuery.error}
            limit={limit}
            onRetry={() => customersQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onEdit={openEditDialog}
            onView={openViewDialog}
            onAssign={openAssignDialog}
            onChangeStatus={openStatusDialog}
            onDelete={openDeleteDialog}
            onRestore={openRestoreDialog}
          />
        </CardContent>
      </Card>

      <CustomerDialog
        open={createOpen}
        isPending={createMutation.isPending}
        error={createMutation.error}
        message={dialogMessage}
        onOpenChange={closeCreateDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          createMutation.mutate(values)
        }}
      />

      <CustomerEditDialog
        open={Boolean(editCustomer)}
        customer={editCustomer}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        onOpenChange={closeEditDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <CustomerDetailDialog
        open={Boolean(viewCustomer)}
        customerId={viewCustomer?.id ?? null}
        onOpenChange={(open) => {
          if (!open) setViewCustomer(null)
        }}
      />

      <CustomerAssignDialog
        open={Boolean(assignCustomer)}
        customer={assignCustomer}
        isPending={assignMutation.isPending}
        error={assignMutation.error}
        message={dialogMessage}
        onOpenChange={closeAssignDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          assignMutation.mutate(values)
        }}
      />

      <CustomerStatusDialog
        open={Boolean(statusCustomer)}
        customer={statusCustomer}
        isPending={statusMutation.isPending}
        error={statusMutation.error}
        message={dialogMessage}
        onOpenChange={closeStatusDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          statusMutation.mutate(values)
        }}
      />

      <CustomerConfirmDialog
        mode="delete"
        open={Boolean(deleteCustomer)}
        customer={deleteCustomer}
        isPending={deleteMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeDeleteDialog}
        onConfirm={() => {
          setDialogMessage(null)
          deleteMutation.mutate()
        }}
      />

      <CustomerConfirmDialog
        mode="restore"
        open={Boolean(restoreCustomer)}
        customer={restoreCustomer}
        isPending={restoreMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeRestoreDialog}
        onConfirm={() => {
          setDialogMessage(null)
          restoreMutation.mutate()
        }}
      />
    </section>
  )
}

export function CustomersPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CustomersPageContent />
    </Suspense>
  )
}
