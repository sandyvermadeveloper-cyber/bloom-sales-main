"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarPlus } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { adminEmployeesApi } from "@/api/employees.api"
import { followUpsApi } from "@/api/follow-ups.api"
import { leadsApi } from "@/api/leads.api"
import { FollowUpAssignDialog } from "@/components/follow-ups/follow-up-assign-dialog"
import { FollowUpCompleteDialog } from "@/components/follow-ups/follow-up-complete-dialog"
import { FollowUpConfirmDialog } from "@/components/follow-ups/follow-up-confirm-dialog"
import { FollowUpDetailDialog } from "@/components/follow-ups/follow-up-detail-dialog"
import { FollowUpDialog } from "@/components/follow-ups/follow-up-dialog"
import { FollowUpEditDialog } from "@/components/follow-ups/follow-up-edit-dialog"
import { FollowUpRescheduleDialog } from "@/components/follow-ups/follow-up-reschedule-dialog"
import {
  defaultFollowUpPageSize,
  followUpPageSizeOptions,
  followUpViewLabels,
  followUpViews,
} from "@/components/follow-ups/follow-ups.constants"
import {
  followUpFormToCreateInput,
  followUpFormToUpdateInput,
  fromDateTimeInputValue,
  getClientTimezoneOffset,
  getFollowUpApiMessage,
  normalizeFollowUpSearch,
  parseFollowUpLimit,
  parseFollowUpPage,
  parseFollowUpStatus,
  parseFollowUpView,
} from "@/components/follow-ups/follow-ups.utils"
import { FollowUpsFilters } from "@/components/follow-ups/follow-ups-filters"
import { FollowUpsTable } from "@/components/follow-ups/follow-ups-table"
import { TableRefetchButton } from "@/components/shared/table-refetch-button"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  FollowUpAssignFormValues,
  FollowUpCompleteFormValues,
  FollowUpFormValues,
  FollowUpRescheduleFormValues,
  FollowUpUpdateFormValues,
} from "@/schemas/follow-up.schemas"
import type { FollowUp, FollowUpStatus, FollowUpView, ListFollowUpsQuery } from "@/types/follow-up"

function FollowUpsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()

  const [view, setView] = useState<FollowUpView>(() => parseFollowUpView(searchParams.get("view")))
  const [page, setPage] = useState(() => parseFollowUpPage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof followUpPageSizeOptions)[number]>(() =>
    parseFollowUpLimit(searchParams.get("limit"))
  )
  const [searchDraft, setSearchDraft] = useState(() => normalizeFollowUpSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeFollowUpSearch(searchParams.get("search")))
  const [status, setStatus] = useState<FollowUpStatus | "all">(() => parseFollowUpStatus(searchParams.get("status")))
  const [assigneeId, setAssigneeId] = useState(() => searchParams.get("assigneeId") || "all")

  const [createOpen, setCreateOpen] = useState(false)
  const [editFollowUp, setEditFollowUp] = useState<FollowUp | null>(null)
  const [viewFollowUp, setViewFollowUp] = useState<FollowUp | null>(null)
  const [assignFollowUp, setAssignFollowUp] = useState<FollowUp | null>(null)
  const [completeFollowUp, setCompleteFollowUp] = useState<FollowUp | null>(null)
  const [rescheduleFollowUp, setRescheduleFollowUp] = useState<FollowUp | null>(null)
  const [cancelFollowUp, setCancelFollowUp] = useState<FollowUp | null>(null)
  const [reopenFollowUp, setReopenFollowUp] = useState<FollowUp | null>(null)
  const [missedFollowUp, setMissedFollowUp] = useState<FollowUp | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)
  const [leadSearch, setLeadSearch] = useState("")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeFollowUpSearch(searchDraft)

      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (view !== "inbox") params.set("view", view)
    if (page > 1) params.set("page", String(page))
    if (limit !== defaultFollowUpPageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)
    if (status !== "all") params.set("status", status)
    if (assigneeId !== "all") params.set("assigneeId", assigneeId)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [assigneeId, limit, page, pathname, router, search, searchParamsString, status, view])

  const timezoneOffset = useMemo(() => getClientTimezoneOffset(), [])

  const query: ListFollowUpsQuery = useMemo(
    () => ({
      page,
      limit,
      view,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      assignedToEmployeeId: assigneeId !== "all" ? assigneeId : undefined,
      timezoneOffset,
    }),
    [assigneeId, limit, page, search, status, timezoneOffset, view]
  )

  const followUpsQuery = useQuery({
    queryKey: ["follow-ups", query],
    queryFn: () => followUpsApi.list(query),
    placeholderData: keepPreviousData,
  })

  const statsQuery = useQuery({
    queryKey: ["follow-ups", "stats", timezoneOffset],
    queryFn: () => followUpsApi.stats(timezoneOffset),
    staleTime: 60 * 1000,
  })

  const employeesQuery = useQuery({
    queryKey: ["employees", "follow-up-options"],
    queryFn: () => adminEmployeesApi.list({ page: 1, limit: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const leadsQuery = useQuery({
    queryKey: ["leads", "follow-up-options", leadSearch],
    queryFn: () => leadsApi.list({ page: 1, limit: 20, search: leadSearch || undefined }),
    staleTime: 60 * 1000,
  })

  const followUps = followUpsQuery.data?.data.followUps ?? []
  const pagination = followUpsQuery.data?.data.pagination
  const stats = statsQuery.data?.data
  const employees = employeesQuery.data?.data.employees ?? []
  const leadOptions = useMemo(
    () =>
      (leadsQuery.data?.data.leads ?? []).map((lead) => ({
        value: lead.id,
        label: lead.title || lead.leadNumber || lead.id,
      })),
    [leadsQuery.data]
  )

  const invalidateFollowUps = () => {
    void queryClient.invalidateQueries({ queryKey: ["follow-ups"] })
  }

  const resetDialogState = () => {
    setDialogMessage(null)
    setPageMessage(null)
  }

  const createMutation = useMutation({
    mutationFn: (values: FollowUpFormValues) => followUpsApi.create(followUpFormToCreateInput(values)),
    onSuccess: (response) => {
      setCreateOpen(false)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to schedule follow-up. Please try again."))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: FollowUpUpdateFormValues) => {
      if (!editFollowUp) throw new Error("Follow-up is required to update.")

      return followUpsApi.update(editFollowUp.id, followUpFormToUpdateInput(values))
    },
    onSuccess: (response) => {
      setEditFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to update follow-up. Please try again."))
    },
  })

  const assignMutation = useMutation({
    mutationFn: (values: FollowUpAssignFormValues) => {
      if (!assignFollowUp) throw new Error("Follow-up is required to assign.")

      return followUpsApi.assign(assignFollowUp.id, values)
    },
    onSuccess: (response) => {
      setAssignFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to assign follow-up. Please try again."))
    },
  })

  const completeMutation = useMutation({
    mutationFn: (values: FollowUpCompleteFormValues) => {
      if (!completeFollowUp) throw new Error("Follow-up is required to complete.")

      return followUpsApi.complete(completeFollowUp.id, values)
    },
    onSuccess: (response) => {
      setCompleteFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to complete follow-up. Please try again."))
    },
  })

  const rescheduleMutation = useMutation({
    mutationFn: (values: FollowUpRescheduleFormValues) => {
      if (!rescheduleFollowUp) throw new Error("Follow-up is required to reschedule.")

      return followUpsApi.reschedule(rescheduleFollowUp.id, {
        scheduledAt: fromDateTimeInputValue(values.scheduledAt),
        reason: values.reason,
      })
    },
    onSuccess: (response) => {
      setRescheduleFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to reschedule follow-up. Please try again."))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => {
      if (!cancelFollowUp) throw new Error("Follow-up is required to cancel.")

      return followUpsApi.cancel(cancelFollowUp.id, { reason })
    },
    onSuccess: (response) => {
      setCancelFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to cancel follow-up. Please try again."))
    },
  })

  const reopenMutation = useMutation({
    mutationFn: (reason?: string) => {
      if (!reopenFollowUp) throw new Error("Follow-up is required to reopen.")

      return followUpsApi.reopen(reopenFollowUp.id, { reason })
    },
    onSuccess: (response) => {
      setReopenFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to reopen follow-up. Please try again."))
    },
  })

  const missedMutation = useMutation({
    mutationFn: () => {
      if (!missedFollowUp) throw new Error("Follow-up is required to mark as missed.")

      return followUpsApi.markMissed(missedFollowUp.id)
    },
    onSuccess: (response) => {
      setMissedFollowUp(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateFollowUps()
    },
    onError: (error) => {
      setDialogMessage(getFollowUpApiMessage(error, "Unable to mark follow-up as missed. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultFollowUpPageSize)
    setSearch("")
    setSearchDraft("")
    setStatus("all")
    setAssigneeId("all")
  }

  const openCreateDialog = () => {
    createMutation.reset()
    resetDialogState()
    setLeadSearch("")
    setCreateOpen(true)
  }

  const closeCreateDialog = (open: boolean) => {
    setCreateOpen(open)
    if (!open && !createMutation.isPending) setDialogMessage(null)
  }

  const openEditDialog = (followUp: FollowUp) => {
    updateMutation.reset()
    resetDialogState()
    setEditFollowUp(followUp)
  }

  const closeEditDialog = (open: boolean) => {
    if (open || updateMutation.isPending) return
    setEditFollowUp(null)
    setDialogMessage(null)
  }

  const openAssignDialog = (followUp: FollowUp) => {
    assignMutation.reset()
    resetDialogState()
    setAssignFollowUp(followUp)
  }

  const closeAssignDialog = (open: boolean) => {
    if (open || assignMutation.isPending) return
    setAssignFollowUp(null)
    setDialogMessage(null)
  }

  const openCompleteDialog = (followUp: FollowUp) => {
    completeMutation.reset()
    resetDialogState()
    setCompleteFollowUp(followUp)
  }

  const closeCompleteDialog = (open: boolean) => {
    if (open || completeMutation.isPending) return
    setCompleteFollowUp(null)
    setDialogMessage(null)
  }

  const openRescheduleDialog = (followUp: FollowUp) => {
    rescheduleMutation.reset()
    resetDialogState()
    setRescheduleFollowUp(followUp)
  }

  const closeRescheduleDialog = (open: boolean) => {
    if (open || rescheduleMutation.isPending) return
    setRescheduleFollowUp(null)
    setDialogMessage(null)
  }

  const openCancelDialog = (followUp: FollowUp) => {
    cancelMutation.reset()
    resetDialogState()
    setCancelFollowUp(followUp)
  }

  const closeCancelDialog = (open: boolean) => {
    if (open || cancelMutation.isPending) return
    setCancelFollowUp(null)
    setDialogMessage(null)
  }

  const openReopenDialog = (followUp: FollowUp) => {
    reopenMutation.reset()
    resetDialogState()
    setReopenFollowUp(followUp)
  }

  const closeReopenDialog = (open: boolean) => {
    if (open || reopenMutation.isPending) return
    setReopenFollowUp(null)
    setDialogMessage(null)
  }

  const openMissedDialog = (followUp: FollowUp) => {
    missedMutation.reset()
    resetDialogState()
    setMissedFollowUp(followUp)
  }

  const closeMissedDialog = (open: boolean) => {
    if (open || missedMutation.isPending) return
    setMissedFollowUp(null)
    setDialogMessage(null)
  }

  const openViewDialog = (followUp: FollowUp) => {
    setViewFollowUp(followUp)
  }

  return (
    <section className="page-section">
      <div className="flex gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="page-header">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Follow-Ups</h1>
          <p className="text-sm text-muted-foreground">
            Track, schedule, and manage follow-up tasks for your leads.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TableRefetchButton isFetching={followUpsQuery.isFetching} onRefetch={() => followUpsQuery.refetch()} />
          <Button onClick={openCreateDialog} className="h-10">
            <CalendarPlus className="size-4" />
            Schedule Follow-Up
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Inbox" value={stats?.inboxCount} isLoading={statsQuery.isLoading} />
        <StatCard label="Overdue" value={stats?.overdueCount} isLoading={statsQuery.isLoading} />
        <StatCard label="Upcoming" value={stats?.upcomingCount} isLoading={statsQuery.isLoading} />
        <StatCard label="Completed Today" value={stats?.completedTodayCount} isLoading={statsQuery.isLoading} />
      </div>

      <Card>
        <CardHeader className="flex gap-2 sm:flex-row sm:items-center justify-between">
          <CardTitle>Follow-Ups</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} follow-ups - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <Tabs
            value={view}
            onValueChange={(value) => {
              setPage(1)
              setView(value as FollowUpView)
            }}
          >
            <TabsList className=" w-full">
              {followUpViews.map((followUpView) => (
                <TabsTrigger key={followUpView} value={followUpView}>
                  {followUpViewLabels[followUpView]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <FollowUpsFilters
            searchDraft={searchDraft}
            status={status}
            assigneeId={assigneeId}
            employees={employees}
            isLoadingEmployees={employeesQuery.isLoading}
            onSearchDraftChange={setSearchDraft}
            onStatusChange={(nextStatus) => {
              setPage(1)
              setStatus(nextStatus)
            }}
            onAssigneeChange={(nextAssigneeId) => {
              setPage(1)
              setAssigneeId(nextAssigneeId)
            }}
            onReset={resetFilters}
          />

          <FollowUpsTable
            followUps={followUps}
            pagination={pagination}
            isLoading={followUpsQuery.isLoading}
            isFetching={followUpsQuery.isFetching}
            isError={followUpsQuery.isError}
            error={followUpsQuery.error}
            limit={limit}
            onRetry={() => followUpsQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onView={openViewDialog}
            onEdit={openEditDialog}
            onAssign={openAssignDialog}
            onComplete={openCompleteDialog}
            onReschedule={openRescheduleDialog}
            onCancel={openCancelDialog}
            onReopen={openReopenDialog}
            onMarkMissed={openMissedDialog}
          />
        </CardContent>
      </Card>

      <FollowUpDialog
        open={createOpen}
        isPending={createMutation.isPending}
        error={createMutation.error}
        message={dialogMessage}
        leadOptions={leadOptions}
        isLoadingLeadOptions={leadsQuery.isLoading}
        onLeadSearchChange={setLeadSearch}
        employees={employees}
        isLoadingEmployees={employeesQuery.isLoading}
        onOpenChange={closeCreateDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          createMutation.mutate(values)
        }}
      />

      <FollowUpEditDialog
        open={Boolean(editFollowUp)}
        followUp={editFollowUp}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        employees={employees}
        isLoadingEmployees={employeesQuery.isLoading}
        onOpenChange={closeEditDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <FollowUpDetailDialog
        open={Boolean(viewFollowUp)}
        followUp={viewFollowUp}
        onOpenChange={(open) => {
          if (!open) setViewFollowUp(null)
        }}
      />

      <FollowUpAssignDialog
        open={Boolean(assignFollowUp)}
        followUp={assignFollowUp}
        isPending={assignMutation.isPending}
        error={assignMutation.error}
        message={dialogMessage}
        employees={employees}
        isLoadingEmployees={employeesQuery.isLoading}
        onOpenChange={closeAssignDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          assignMutation.mutate(values)
        }}
      />

      <FollowUpCompleteDialog
        open={Boolean(completeFollowUp)}
        followUp={completeFollowUp}
        isPending={completeMutation.isPending}
        error={completeMutation.error}
        message={dialogMessage}
        onOpenChange={closeCompleteDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          completeMutation.mutate(values)
        }}
      />

      <FollowUpRescheduleDialog
        open={Boolean(rescheduleFollowUp)}
        followUp={rescheduleFollowUp}
        isPending={rescheduleMutation.isPending}
        error={rescheduleMutation.error}
        message={dialogMessage}
        onOpenChange={closeRescheduleDialog}
        onSubmit={(values) => {
          setDialogMessage(null)
          rescheduleMutation.mutate(values)
        }}
      />

      <FollowUpConfirmDialog
        mode="cancel"
        open={Boolean(cancelFollowUp)}
        followUp={cancelFollowUp}
        isPending={cancelMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeCancelDialog}
        onConfirm={(reason) => {
          setDialogMessage(null)
          cancelMutation.mutate(reason)
        }}
      />

      <FollowUpConfirmDialog
        mode="reopen"
        open={Boolean(reopenFollowUp)}
        followUp={reopenFollowUp}
        isPending={reopenMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeReopenDialog}
        onConfirm={(reason) => {
          setDialogMessage(null)
          reopenMutation.mutate(reason)
        }}
      />

      <FollowUpConfirmDialog
        mode="missed"
        open={Boolean(missedFollowUp)}
        followUp={missedFollowUp}
        isPending={missedMutation.isPending}
        message={dialogMessage}
        onOpenChange={closeMissedDialog}
        onConfirm={() => {
          setDialogMessage(null)
          missedMutation.mutate()
        }}
      />
    </section>
  )
}

function StatCard({ label, value, isLoading }: { label: string; value?: number; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-foreground">{value ?? 0}</p>
      )}
    </div>
  )
}

export function FollowUpsPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <FollowUpsPageContent />
    </Suspense>
  )
}
