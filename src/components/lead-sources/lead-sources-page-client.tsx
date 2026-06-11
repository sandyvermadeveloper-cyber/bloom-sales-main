"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { leadSourcesApi } from "@/api/lead-sources.api"
import { LeadSourceConfirmDialog } from "@/components/lead-sources/lead-source-confirm-dialog"
import { LeadSourceDialog } from "@/components/lead-sources/lead-source-dialog"
import {
  defaultLeadSourcePageSize,
  leadSourcePageSizeOptions,
} from "@/components/lead-sources/lead-sources.constants"
import { LeadSourcesFilters } from "@/components/lead-sources/lead-sources-filters"
import { LeadSourcesTable } from "@/components/lead-sources/lead-sources-table"
import {
  getLeadSourceApiMessage,
  normalizeLeadSourceSearch,
  parseLeadSourceLimit,
  parseLeadSourcePage,
} from "@/components/lead-sources/lead-sources.utils"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LeadSourceFormValues } from "@/schemas/lead-source.schemas"
import type { LeadSource, ListLeadSourcesQuery } from "@/types/lead-source"

function LeadSourcesPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(() => parseLeadSourcePage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof leadSourcePageSizeOptions)[number]>(() =>
    parseLeadSourceLimit(searchParams.get("limit"))
  )
  const [searchDraft, setSearchDraft] = useState(() =>
    normalizeLeadSourceSearch(searchParams.get("search"))
  )
  const [search, setSearch] = useState(() => normalizeLeadSourceSearch(searchParams.get("search")))
  const [createOpen, setCreateOpen] = useState(false)
  const [editLeadSource, setEditLeadSource] = useState<LeadSource | null>(null)
  const [deleteLeadSource, setDeleteLeadSource] = useState<LeadSource | null>(null)
  const [restoreLeadSource, setRestoreLeadSource] = useState<LeadSource | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeLeadSourceSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultLeadSourcePageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, router, search, searchParamsString])

  const query: ListLeadSourcesQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [limit, page, search]
  )

  const leadSourcesQuery = useQuery({
    queryKey: ["lead-sources", query],
    queryFn: () => leadSourcesApi.list(query),
    placeholderData: keepPreviousData,
  })

  const leadSources = leadSourcesQuery.data?.data.leadSources ?? []
  const pagination = leadSourcesQuery.data?.data.pagination

  const invalidateLeadSources = () => {
    void queryClient.invalidateQueries({ queryKey: ["lead-sources"] })
  }

  const createMutation = useMutation({
    mutationFn: (values: LeadSourceFormValues) => leadSourcesApi.create(values),
    onSuccess: (response) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeadSources()
    },
    onError: (error) => {
      setDialogMessage(getLeadSourceApiMessage(error, "Unable to create lead source. Please try again."))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: LeadSourceFormValues) => {
      if (!editLeadSource) throw new Error("Lead source is required to update.")

      return leadSourcesApi.update(editLeadSource.id, values)
    },
    onSuccess: (response) => {
      setEditLeadSource(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeadSources()
    },
    onError: (error) => {
      setDialogMessage(getLeadSourceApiMessage(error, "Unable to update lead source. Please try again."))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!deleteLeadSource) throw new Error("Lead source is required to delete.")

      return leadSourcesApi.delete(deleteLeadSource.id)
    },
    onSuccess: (response) => {
      setDeleteLeadSource(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeadSources()
    },
    onError: (error) => {
      setDialogMessage(getLeadSourceApiMessage(error, "Unable to delete lead source. Please try again."))
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!restoreLeadSource) throw new Error("Lead source is required to restore.")

      return leadSourcesApi.restore(restoreLeadSource.id)
    },
    onSuccess: (response) => {
      setRestoreLeadSource(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeadSources()
    },
    onError: (error) => {
      setDialogMessage(getLeadSourceApiMessage(error, "Unable to restore lead source. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultLeadSourcePageSize)
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

  const openEditDialog = (leadSource: LeadSource) => {
    updateMutation.reset()
    resetDialogState()
    setEditLeadSource(leadSource)
  }

  const openDeleteDialog = (leadSource: LeadSource) => {
    deleteMutation.reset()
    resetDialogState()
    setDeleteLeadSource(leadSource)
  }

  const openRestoreDialog = (leadSource: LeadSource) => {
    restoreMutation.reset()
    resetDialogState()
    setRestoreLeadSource(leadSource)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) setDialogMessage(null)
  }

  const closeEditDialog = (open: boolean) => {
    if (open || updateMutation.isPending) return
    setEditLeadSource(null)
    setDialogMessage(null)
  }

  const closeDeleteDialog = (open: boolean) => {
    if (open || deleteMutation.isPending) return
    setDeleteLeadSource(null)
    setDialogMessage(null)
  }

  const closeRestoreDialog = (open: boolean) => {
    if (open || restoreMutation.isPending) return
    setRestoreLeadSource(null)
    setDialogMessage(null)
  }

  return (
    <section className="page-section">
      <div className="flex gap-4 sm:flex-row sm:items-start justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lead Sources</h1>
          <p className="text-sm text-muted-foreground">
            Manage lead source options used for customer acquisition tracking.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="h-10">
          <MapPin className="size-4" />
          Add lead source
        </Button>
      </div>

      <Card>
        <CardHeader className="flex gap-2 sm:flex-row sm:items-center justify-between">
          <CardTitle>Lead Sources</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} lead sources - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <LeadSourcesFilters
            searchDraft={searchDraft}
            onSearchDraftChange={setSearchDraft}
            onReset={resetFilters}
          />

          <LeadSourcesTable
            leadSources={leadSources}
            pagination={pagination}
            isLoading={leadSourcesQuery.isLoading}
            isFetching={leadSourcesQuery.isFetching}
            isError={leadSourcesQuery.isError}
            error={leadSourcesQuery.error}
            limit={limit}
            onRetry={() => leadSourcesQuery.refetch()}
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

      <LeadSourceDialog
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

      <LeadSourceDialog
        mode="edit"
        open={Boolean(editLeadSource)}
        leadSource={editLeadSource}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        onOpenChange={closeEditDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <LeadSourceConfirmDialog
        mode="delete"
        open={Boolean(deleteLeadSource)}
        leadSource={deleteLeadSource}
        isPending={deleteMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeDeleteDialog}
        onConfirm={() => {
          setDialogMessage(null)
          deleteMutation.mutate()
        }}
      />

      <LeadSourceConfirmDialog
        mode="restore"
        open={Boolean(restoreLeadSource)}
        leadSource={restoreLeadSource}
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

export function LeadSourcesPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LeadSourcesPageContent />
    </Suspense>
  )
}
