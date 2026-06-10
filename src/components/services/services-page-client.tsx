"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Wrench } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { servicesApi } from "@/api/services.api"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ServiceConfirmDialog } from "@/components/services/service-confirm-dialog"
import { ServiceDialog } from "@/components/services/service-dialog"
import { ServicesFilters } from "@/components/services/services-filters"
import { ServicesTable } from "@/components/services/services-table"
import { defaultServicePageSize, servicePageSizeOptions } from "@/components/services/services.constants"
import {
  getServiceApiMessage,
  normalizeServiceSearch,
  parseServiceLimit,
  parseServicePage,
} from "@/components/services/services.utils"
import type { ServiceFormValues } from "@/schemas/service.schemas"
import type { ListServicesQuery, Service } from "@/types/service"

function ServicesPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(() => parseServicePage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof servicePageSizeOptions)[number]>(() =>
    parseServiceLimit(searchParams.get("limit"))
  )
  const [searchDraft, setSearchDraft] = useState(() => normalizeServiceSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeServiceSearch(searchParams.get("search")))
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [restoreService, setRestoreService] = useState<Service | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeServiceSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultServicePageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, router, search, searchParamsString])

  const query: ListServicesQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [limit, page, search]
  )

  const servicesQuery = useQuery({
    queryKey: ["services", query],
    queryFn: () => servicesApi.list(query),
    placeholderData: keepPreviousData,
  })

  const services = servicesQuery.data?.data.services ?? []
  const pagination = servicesQuery.data?.data.pagination

  const invalidateServices = () => {
    void queryClient.invalidateQueries({ queryKey: ["services"] })
  }

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => servicesApi.create(values),
    onSuccess: (response) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateServices()
    },
    onError: (error) => {
      setDialogMessage(getServiceApiMessage(error, "Unable to create service. Please try again."))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => {
      if (!editService) throw new Error("Service is required to update.")

      return servicesApi.update(editService.id, values)
    },
    onSuccess: (response) => {
      setEditService(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateServices()
    },
    onError: (error) => {
      setDialogMessage(getServiceApiMessage(error, "Unable to update service. Please try again."))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!deleteService) throw new Error("Service is required to delete.")

      return servicesApi.delete(deleteService.id)
    },
    onSuccess: (response) => {
      setDeleteService(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateServices()
    },
    onError: (error) => {
      setDialogMessage(getServiceApiMessage(error, "Unable to delete service. Please try again."))
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!restoreService) throw new Error("Service is required to restore.")

      return servicesApi.restore(restoreService.id)
    },
    onSuccess: (response) => {
      setRestoreService(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateServices()
    },
    onError: (error) => {
      setDialogMessage(getServiceApiMessage(error, "Unable to restore service. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultServicePageSize)
    setSearch("")
    setSearchDraft("")
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

  const openEditDialog = (service: Service) => {
    updateMutation.reset()
    resetDialogState()
    setEditService(service)
  }

  const openDeleteDialog = (service: Service) => {
    deleteMutation.reset()
    resetDialogState()
    setDeleteService(service)
  }

  const openRestoreDialog = (service: Service) => {
    restoreMutation.reset()
    resetDialogState()
    setRestoreService(service)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) setDialogMessage(null)
  }

  const closeEditDialog = (open: boolean) => {
    if (open || updateMutation.isPending) return
    setEditService(null)
    setDialogMessage(null)
  }

  const closeDeleteDialog = (open: boolean) => {
    if (open || deleteMutation.isPending) return
    setDeleteService(null)
    setDialogMessage(null)
  }

  const closeRestoreDialog = (open: boolean) => {
    if (open || restoreMutation.isPending) return
    setRestoreService(null)
    setDialogMessage(null)
  }

  return (
    <section className="page-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage CRM services used across leads and customer workflows.
          </p>
        </div>
        <Button onClick={openCreateDialog} className=" h-10">
          <Wrench className="size-4" />
          Add service
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Services</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} services - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <ServicesFilters
            searchDraft={searchDraft}
            onSearchDraftChange={setSearchDraft}
            onReset={resetFilters}
          />

          <ServicesTable
            services={services}
            pagination={pagination}
            isLoading={servicesQuery.isLoading}
            isFetching={servicesQuery.isFetching}
            isError={servicesQuery.isError}
            error={servicesQuery.error}
            limit={limit}
            onRetry={() => servicesQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onRestore={openRestoreDialog}
          />
        </CardContent>
      </Card>

      <ServiceDialog
        mode="create"
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

      <ServiceDialog
        mode="edit"
        open={Boolean(editService)}
        service={editService}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        onOpenChange={closeEditDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <ServiceConfirmDialog
        mode="delete"
        open={Boolean(deleteService)}
        service={deleteService}
        isPending={deleteMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeDeleteDialog}
        onConfirm={() => {
          setDialogMessage(null)
          deleteMutation.mutate()
        }}
      />

      <ServiceConfirmDialog
        mode="restore"
        open={Boolean(restoreService)}
        service={restoreService}
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

export function ServicesPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ServicesPageContent />
    </Suspense>
  )
}
