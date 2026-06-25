"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Target } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { leadSourcesApi } from "@/api/lead-sources.api"
import { leadsApi } from "@/api/leads.api"
import { servicesApi } from "@/api/services.api"
import { TableRefetchButton } from "@/components/shared/table-refetch-button"
import { LeadConfirmDialog } from "@/components/crm/leads/lead-confirm-dialog"
import { LeadConvertDialog } from "@/components/crm/leads/lead-convert-dialog"
import { LeadDetailDialog } from "@/components/crm/leads/lead-detail-dialog"
import { LeadDialog } from "@/components/crm/leads/lead-dialog"
import { LeadEditDialog } from "@/components/crm/leads/lead-edit-dialog"
import { LeadStatusDialog } from "@/components/crm/leads/lead-status-dialog"
import { defaultLeadPageSize, leadPageSizeOptions } from "@/components/crm/leads/leads.constants"
import { LeadsFilters } from "@/components/crm/leads/leads-filters"
import { LeadsTable } from "@/components/crm/leads/leads-table"
import {
  getLeadApiMessage,
  leadFormToCreateInput,
  leadFormToUpdateInput,
  normalizeLeadSearch,
  parseLeadLimit,
  parseLeadPage,
  parseLeadPriority,
  parseLeadQualification,
  parseLeadStatus,
} from "@/components/crm/leads/leads.utils"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  LeadConvertFormValues,
  LeadFormValues,
  LeadStatusChangeFormValues,
  LeadUpdateFormValues,
} from "@/schemas/lead.schemas"
import type { Lead, LeadPriority, LeadQualification, LeadStatus, ListLeadsQuery } from "@/types/lead"

function LeadsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(() => parseLeadPage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof leadPageSizeOptions)[number]>(() =>
    parseLeadLimit(searchParams.get("limit"))
  )
  const [searchDraft, setSearchDraft] = useState(() => normalizeLeadSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeLeadSearch(searchParams.get("search")))
  const [status, setStatus] = useState<LeadStatus | "all">(() => parseLeadStatus(searchParams.get("status")))
  const [priority, setPriority] = useState<LeadPriority | "all">(() =>
    parseLeadPriority(searchParams.get("priority"))
  )
  const [qualification, setQualification] = useState<LeadQualification | "all">(() =>
    parseLeadQualification(searchParams.get("qualification"))
  )
  const [sourceId, setSourceId] = useState(() => searchParams.get("sourceId") || "all")
  const [serviceId, setServiceId] = useState(() => searchParams.get("serviceId") || "all")
  const [createOpen, setCreateOpen] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [viewLead, setViewLead] = useState<Lead | null>(null)
  const [statusLead, setStatusLead] = useState<Lead | null>(null)
  const [convertLead, setConvertLead] = useState<Lead | null>(null)
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null)
  const [restoreLead, setRestoreLead] = useState<Lead | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)
  const [sourceSearch, setSourceSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeLeadSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultLeadPageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)
    if (status !== "all") params.set("status", status)
    if (priority !== "all") params.set("priority", priority)
    if (qualification !== "all") params.set("qualification", qualification)
    if (sourceId !== "all") params.set("sourceId", sourceId)
    if (serviceId !== "all") params.set("serviceId", serviceId)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, priority, qualification, router, search, searchParamsString, serviceId, sourceId, status])

  const query: ListLeadsQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      priority: priority !== "all" ? priority : undefined,
      qualification: qualification !== "all" ? qualification : undefined,
      sourceId: sourceId !== "all" ? sourceId : undefined,
      serviceId: serviceId !== "all" ? serviceId : undefined,
    }),
    [limit, page, priority, qualification, search, serviceId, sourceId, status]
  )

  const leadsQuery = useQuery({
    queryKey: ["leads", page, limit, search, status, priority, qualification, sourceId, serviceId],
    queryFn: () => leadsApi.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

  const sourcesQuery = useQuery({
    queryKey: ["lead-sources", "lead-form-options", sourceSearch],
    queryFn: () => leadSourcesApi.list({ page: 1, limit: 20, search: sourceSearch || undefined }),
    enabled: sourceSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const servicesQuery = useQuery({
    queryKey: ["services", "lead-form-options", serviceSearch],
    queryFn: () => servicesApi.list({ page: 1, limit: 20, search: serviceSearch || undefined }),
    enabled: createOpen && serviceSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const leads = leadsQuery.data?.data.leads ?? []
  const pagination = leadsQuery.data?.data.pagination
  const sources = sourcesQuery.data?.data.leadSources ?? []
  const services = servicesQuery.data?.data.services ?? []
  const isLoadingOptions = sourcesQuery.isLoading || servicesQuery.isLoading
  const optionsMessage =
    sourcesQuery.isError || servicesQuery.isError
      ? getLeadApiMessage(
          sourcesQuery.error ?? servicesQuery.error,
          "Unable to load lead form options. Please try again."
        )
      : null

  const invalidateLeads = () => {
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
  }

  const invalidateCustomers = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers"] })
  }

  const createMutation = useMutation({
    mutationFn: async (values: LeadFormValues) => {
      const response = await leadsApi.create(leadFormToCreateInput(values))
      const leadId = response.data.id

      if (!values.existingContactIds.length) {
        return { response, attachWarning: null }
      }

      const attachResults = await Promise.allSettled(
        values.existingContactIds.map((contactId, index) =>
          leadsApi.addContact(leadId, {
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
            ? `Lead created, but ${failedAttachCount} existing contact link failed. Please open the lead and retry.`
            : null,
      }
    },
    onSuccess: ({ response, attachWarning }) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setPageMessage(attachWarning ?? response.message)
      invalidateLeads()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to create lead. Please try again."))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: LeadUpdateFormValues) => {
      if (!editLead) throw new Error("Lead is required to update.")

      return leadsApi.update(editLead.id, leadFormToUpdateInput(values))
    },
    onSuccess: (response) => {
      setEditLead(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeads()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to update lead. Please try again."))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!deleteLead) throw new Error("Lead is required to delete.")

      return leadsApi.delete(deleteLead.id)
    },
    onSuccess: (response) => {
      setDeleteLead(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeads()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to delete lead. Please try again."))
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!restoreLead) throw new Error("Lead is required to restore.")

      return leadsApi.restore(restoreLead.id)
    },
    onSuccess: (response) => {
      setRestoreLead(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeads()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to restore lead. Please try again."))
    },
  })

  const statusMutation = useMutation({
    mutationFn: (values: LeadStatusChangeFormValues) => {
      if (!statusLead) throw new Error("Lead is required to change status.")

      return leadsApi.changeStatus(statusLead.id, values)
    },
    onSuccess: (response) => {
      setStatusLead(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeads()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to change lead status. Please try again."))
    },
  })

  const convertMutation = useMutation({
    mutationFn: (values: LeadConvertFormValues) => {
      if (!convertLead) throw new Error("Lead is required to convert.")

      return leadsApi.convert(convertLead.id, values)
    },
    onSuccess: (response) => {
      setConvertLead(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateLeads()
      invalidateCustomers()
    },
    onError: (error) => {
      setDialogMessage(getLeadApiMessage(error, "Unable to convert lead. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultLeadPageSize)
    setSearch("")
    setSearchDraft("")
    setStatus("all")
    setPriority("all")
    setQualification("all")
    setSourceId("all")
    setServiceId("all")
    setSourceSearch("")
    setServiceSearch("")
  }

  const resetDialogState = () => {
    setDialogMessage(null)
    setPageMessage(null)
  }

  const openCreateDialog = () => {
    createMutation.reset()
    resetDialogState()
    setSourceSearch("")
    setServiceSearch("")
    setCreateOpen(true)
  }

  const openEditDialog = (lead: Lead) => {
    updateMutation.reset()
    resetDialogState()
    setSourceSearch("")
    setEditLead(lead)
  }

  const openViewDialog = (lead: Lead) => {
    resetDialogState()
    setViewLead(lead)
  }

  const openStatusDialog = (lead: Lead) => {
    statusMutation.reset()
    resetDialogState()
    setStatusLead(lead)
  }

  const openConvertDialog = (lead: Lead) => {
    convertMutation.reset()
    setDialogMessage(null)
    setPageMessage(null)
    setConvertLead(lead)
  }

  const openDeleteDialog = (lead: Lead) => {
    deleteMutation.reset()
    resetDialogState()
    setDeleteLead(lead)
  }

  const openRestoreDialog = (lead: Lead) => {
    restoreMutation.reset()
    resetDialogState()
    setRestoreLead(lead)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) setDialogMessage(null)
  }

  const closeEditDialog = (open: boolean) => {
    if (open || updateMutation.isPending) return
    setEditLead(null)
    setDialogMessage(null)
  }

  const closeStatusDialog = (open: boolean) => {
    if (open || statusMutation.isPending) return
    setStatusLead(null)
    setDialogMessage(null)
  }

  const closeConvertDialog = (open: boolean) => {
    if (open || convertMutation.isPending) return
    setConvertLead(null)
    setDialogMessage(null)
  }

  const closeDeleteDialog = (open: boolean) => {
    if (open || deleteMutation.isPending) return
    setDeleteLead(null)
    setDialogMessage(null)
  }

  const closeRestoreDialog = (open: boolean) => {
    if (open || restoreMutation.isPending) return
    setRestoreLead(null)
    setDialogMessage(null)
  }

  return (
    <section className="page-section">
      <div className="flex  gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">CRM Leads</h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming sales opportunities, sources, services, and primary contacts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TableRefetchButton isFetching={leadsQuery.isFetching} onRefetch={() => leadsQuery.refetch()} />
          <Button onClick={openCreateDialog} className="h-10">
            <Target className="size-4" />
            Add CRM lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex  gap-2 sm:flex-row sm:items-center justify-between">
          <CardTitle>CRM Leads</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} CRM leads - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <LeadsFilters
            searchDraft={searchDraft}
            status={status}
            priority={priority}
            qualification={qualification}
            sourceId={sourceId}
            sources={sources}
            isLoadingOptions={isLoadingOptions}
            onSearchDraftChange={setSearchDraft}
            onStatusChange={(nextStatus) => {
              setPage(1)
              setStatus(nextStatus)
            }}
            onPriorityChange={(nextPriority) => {
              setPage(1)
              setPriority(nextPriority)
            }}
            onQualificationChange={(nextQualification) => {
              setPage(1)
              setQualification(nextQualification)
            }}
            onSourceChange={(nextSourceId) => {
              setPage(1)
              setSourceId(nextSourceId)
            }}
            onSourceSearchChange={setSourceSearch}
            onReset={resetFilters}
          />

          <LeadsTable
            leads={leads}
            pagination={pagination}
            isLoading={leadsQuery.isLoading}
            isFetching={leadsQuery.isFetching}
            isError={leadsQuery.isError}
            error={leadsQuery.error}
            limit={limit}
            onRetry={() => leadsQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onEdit={openEditDialog}
            onView={openViewDialog}
            onChangeStatus={openStatusDialog}
            onConvert={openConvertDialog}
            onDelete={openDeleteDialog}
            onRestore={openRestoreDialog}
          />
        </CardContent>
      </Card>

      <LeadDialog
        open={createOpen}
        isPending={createMutation.isPending}
        error={createMutation.error}
        message={dialogMessage}
        optionsMessage={optionsMessage}
        sources={sources}
        services={services}
        isLoadingOptions={isLoadingOptions}
        onSourceSearchChange={setSourceSearch}
        onServiceSearchChange={setServiceSearch}
        onOpenChange={closeCreateDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          createMutation.mutate(values)
        }}
      />

      <LeadEditDialog
        open={Boolean(editLead)}
        lead={editLead}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        optionsMessage={optionsMessage}
        sources={sources}
        isLoadingOptions={isLoadingOptions}
        onSourceSearchChange={setSourceSearch}
        onOpenChange={closeEditDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <LeadDetailDialog
        open={Boolean(viewLead)}
        leadId={viewLead?.id ?? null}
        onOpenChange={(open) => {
          if (!open) setViewLead(null)
        }}
      />

      <LeadStatusDialog
        open={Boolean(statusLead)}
        lead={statusLead}
        isPending={statusMutation.isPending}
        error={statusMutation.error}
        message={dialogMessage}
        onOpenChange={closeStatusDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          statusMutation.mutate(values)
        }}
      />

      <LeadConvertDialog
        open={Boolean(convertLead)}
        lead={convertLead}
        isPending={convertMutation.isPending}
        error={convertMutation.error}
        message={dialogMessage}
        onOpenChange={closeConvertDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          convertMutation.mutate(values)
        }}
      />

      <LeadConfirmDialog
        mode="delete"
        open={Boolean(deleteLead)}
        lead={deleteLead}
        isPending={deleteMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeDeleteDialog}
        onConfirm={() => {
          setDialogMessage(null)
          deleteMutation.mutate()
        }}
      />

      <LeadConfirmDialog
        mode="restore"
        open={Boolean(restoreLead)}
        lead={restoreLead}
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

export function LeadsPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LeadsPageContent />
    </Suspense>
  )
}
