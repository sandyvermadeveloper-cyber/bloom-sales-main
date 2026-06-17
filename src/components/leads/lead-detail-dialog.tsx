"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Calendar,
  CalendarClock,
  Eye,
  FileText,
  Globe2,
  Loader2,
  Lock,
  Mail,
  MoreHorizontal,
  NotebookText,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
  UserCog,
  UserMinus,
  UserRound,
  WalletCards,
} from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { adminEmployeesApi } from "@/api/employees.api"
import { contactsApi } from "@/api/contacts.api"
import { followUpsApi } from "@/api/follow-ups.api"
import { leadsApi } from "@/api/leads.api"
import { servicesApi } from "@/api/services.api"
import { ContactProfileDialog } from "@/components/contacts/contact-profile-dialog"
import { getContactApiMessage, getContactName } from "@/components/contacts/contacts.utils"
import { FollowUpActionsMenu } from "@/components/follow-ups/follow-up-actions-menu"
import { FollowUpAssignDialog } from "@/components/follow-ups/follow-up-assign-dialog"
import { FollowUpCompleteDialog } from "@/components/follow-ups/follow-up-complete-dialog"
import { FollowUpConfirmDialog } from "@/components/follow-ups/follow-up-confirm-dialog"
import { FollowUpDetailDialog } from "@/components/follow-ups/follow-up-detail-dialog"
import { FollowUpDialog } from "@/components/follow-ups/follow-up-dialog"
import { FollowUpEditDialog } from "@/components/follow-ups/follow-up-edit-dialog"
import { FollowUpRescheduleDialog } from "@/components/follow-ups/follow-up-reschedule-dialog"
import {
  followUpOutcomeBadgeClasses,
  followUpStatusBadgeClasses,
  followUpTypeBadgeClasses,
} from "@/components/follow-ups/follow-ups.constants"
import {
  followUpFormToCreateInput,
  followUpFormToUpdateInput,
  formatFollowUpDateTime,
  fromDateTimeInputValue,
  getFollowUpApiMessage,
  getFollowUpAssigneeName,
  getFollowUpContactName,
  getFollowUpOutcomeLabel,
  getFollowUpStatusLabel,
  getFollowUpTypeLabel,
} from "@/components/follow-ups/follow-ups.utils"
import { LeadContactDialog, type LeadContactFormValues } from "@/components/leads/lead-contact-dialog"
import { SearchableSelect } from "@/components/leads/lead-searchable-select"
import {
  leadPriorityBadgeClasses,
  leadQualificationBadgeClasses,
  leadStatusBadgeClasses,
} from "@/components/leads/leads.constants"
import {
  formatBudget,
  formatLeadCurrency,
  formatLeadDate,
  getLeadApiMessage,
  getLeadOwnerName,
  getLeadPriorityLabel,
  getLeadQualificationLabel,
  getLeadSourceName,
  getLeadStatusLabel,
  getLeadTitle,
} from "@/components/leads/leads.utils"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ContactProfileFormValues } from "@/schemas/contact.schemas"
import type {
  FollowUpAssignFormValues,
  FollowUpCompleteFormValues,
  FollowUpFormValues,
  FollowUpRescheduleFormValues,
  FollowUpUpdateFormValues,
} from "@/schemas/follow-up.schemas"
import { leadAssignSchema, type LeadAssignFormValues } from "@/schemas/lead.schemas"
import type { Employee } from "@/types/employee"
import type { FollowUp } from "@/types/follow-up"
import type {
  Lead,
  LeadActivity,
  LeadAssignment,
  LeadAttachment,
  LeadContact,
  LeadNewContactLinkInput,
  LeadNote,
} from "@/types/lead"
import {
  formatCode,
  formatDescription,
  formatDesignation,
  formatDisplayName,
  formatEmail,
  formatPhoneNumber,
  formatTitleCase,
} from "@/utils/display-format"
import { applyApiFieldErrors } from "@/utils/form-errors"

const leadAssignFields = ["employeeId", "reason"] as const

type LeadDetailDialogProps = {
  leadId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailDialog({ leadId, open, onOpenChange }: LeadDetailDialogProps) {
  const queryClient = useQueryClient()
  const [serviceOpen, setServiceOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editNote, setEditNote] = useState<LeadNote | null>(null)
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<LeadNote | null>(null)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [viewAttachment, setViewAttachment] = useState<LeadAttachment | null>(null)
  const [deleteAttachment, setDeleteAttachment] = useState<LeadAttachment | null>(null)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [editContact, setEditContact] = useState<LeadContact | null>(null)
  const [removeContactTarget, setRemoveContactTarget] = useState<LeadContact | null>(null)
  const [assignLeadOpen, setAssignLeadOpen] = useState(false)
  const [assignLeadMessage, setAssignLeadMessage] = useState<string | null>(null)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [editFollowUp, setEditFollowUp] = useState<FollowUp | null>(null)
  const [viewFollowUp, setViewFollowUp] = useState<FollowUp | null>(null)
  const [assignFollowUp, setAssignFollowUp] = useState<FollowUp | null>(null)
  const [completeFollowUp, setCompleteFollowUp] = useState<FollowUp | null>(null)
  const [rescheduleFollowUp, setRescheduleFollowUp] = useState<FollowUp | null>(null)
  const [cancelFollowUp, setCancelFollowUp] = useState<FollowUp | null>(null)
  const [reopenFollowUp, setReopenFollowUp] = useState<FollowUp | null>(null)
  const [missedFollowUp, setMissedFollowUp] = useState<FollowUp | null>(null)
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState("")

  const detailQuery = useQuery({
    queryKey: ["leads", "detail", leadId],
    queryFn: () => leadsApi.detail(leadId as string),
    enabled: open && Boolean(leadId),
  })
  const activitiesQuery = useQuery({
    queryKey: ["leads", "activities", leadId],
    queryFn: () => leadsApi.activities(leadId as string),
    enabled: open && Boolean(leadId),
  })
  const notesQuery = useQuery({
    queryKey: ["leads", "notes", leadId],
    queryFn: () => leadsApi.notes(leadId as string),
    enabled: open && Boolean(leadId),
  })
  const attachmentsQuery = useQuery({
    queryKey: ["leads", "attachments", leadId],
    queryFn: () => leadsApi.attachments(leadId as string),
    enabled: open && Boolean(leadId),
  })
  const followUpsQuery = useQuery({
    queryKey: ["leads", "follow-ups", leadId],
    queryFn: () =>
      followUpsApi.list({
        leadId: leadId as string,
        page: 1,
        limit: 10,
        view: "all",
        sortBy: "scheduledAt",
        sortOrder: "desc",
      }),
    enabled: open && Boolean(leadId),
  })
  const assignmentsQuery = useQuery({
    queryKey: ["leads", "assignments", leadId],
    queryFn: () => leadsApi.assignments(leadId as string),
    enabled: open && Boolean(leadId),
  })
  const employeesQuery = useQuery({
    queryKey: ["employees", "follow-up-options", employeeSearch],
    queryFn: () => adminEmployeesApi.list({ page: 1, limit: 20, search: employeeSearch || undefined }),
    enabled: open && employeeSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
  const lead = detailQuery.data?.data ?? null
  const followUps = followUpsQuery.data?.data.followUps ?? []
  const employees = employeesQuery.data?.data.employees ?? []

  const existingContacts = lead?.contacts?.length ? lead.contacts : lead?.primaryContact ? [lead.primaryContact] : []
  const existingContactIds = existingContacts.map((contact) => contact.id)

  const invalidateDetail = () => {
    void queryClient.invalidateQueries({ queryKey: ["leads", "detail", leadId] })
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
  }
  const invalidateActivities = () => {
    void queryClient.invalidateQueries({ queryKey: ["leads", "activities", leadId] })
  }
  const invalidateContacts = () => {
    void queryClient.invalidateQueries({ queryKey: ["contacts"] })
  }
  const invalidateFollowUps = () => {
    void queryClient.invalidateQueries({ queryKey: ["leads", "follow-ups", leadId] })
    void queryClient.invalidateQueries({ queryKey: ["follow-ups"] })
  }
  const invalidateAssignments = () => {
    void queryClient.invalidateQueries({ queryKey: ["leads", "assignments", leadId] })
  }

  const assignLeadMutation = useMutation({
    mutationFn: (values: LeadAssignFormValues) => {
      if (!leadId) throw new Error("Lead is required to assign.")

      return leadsApi.assign(leadId, values)
    },
    onSuccess: () => {
      setAssignLeadOpen(false)
      setAssignLeadMessage(null)
      invalidateDetail()
      invalidateAssignments()
      invalidateActivities()
    },
    onError: (error) => setAssignLeadMessage(getLeadApiMessage(error, "Unable to assign lead.")),
  })

  const createFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpFormValues) => followUpsApi.create(followUpFormToCreateInput(values)),
    onSuccess: () => {
      setFollowUpOpen(false)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to schedule follow-up.")),
  })

  const updateFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpUpdateFormValues) => {
      if (!editFollowUp) throw new Error("Follow-up is required to update.")

      return followUpsApi.update(editFollowUp.id, followUpFormToUpdateInput(values))
    },
    onSuccess: () => {
      setEditFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to update follow-up.")),
  })

  const assignFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpAssignFormValues) => {
      if (!assignFollowUp) throw new Error("Follow-up is required to assign.")

      return followUpsApi.assign(assignFollowUp.id, values)
    },
    onSuccess: () => {
      setAssignFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to assign follow-up.")),
  })

  const completeFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpCompleteFormValues) => {
      if (!completeFollowUp) throw new Error("Follow-up is required to complete.")

      return followUpsApi.complete(completeFollowUp.id, values)
    },
    onSuccess: () => {
      setCompleteFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to complete follow-up.")),
  })

  const rescheduleFollowUpMutation = useMutation({
    mutationFn: (values: FollowUpRescheduleFormValues) => {
      if (!rescheduleFollowUp) throw new Error("Follow-up is required to reschedule.")

      return followUpsApi.reschedule(rescheduleFollowUp.id, {
        scheduledAt: fromDateTimeInputValue(values.scheduledAt),
        reason: values.reason,
      })
    },
    onSuccess: () => {
      setRescheduleFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to reschedule follow-up.")),
  })

  const cancelFollowUpMutation = useMutation({
    mutationFn: (reason?: string) => {
      if (!cancelFollowUp) throw new Error("Follow-up is required to cancel.")

      return followUpsApi.cancel(cancelFollowUp.id, { reason })
    },
    onSuccess: () => {
      setCancelFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to cancel follow-up.")),
  })

  const reopenFollowUpMutation = useMutation({
    mutationFn: (reason?: string) => {
      if (!reopenFollowUp) throw new Error("Follow-up is required to reopen.")

      return followUpsApi.reopen(reopenFollowUp.id, { reason })
    },
    onSuccess: () => {
      setReopenFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to reopen follow-up.")),
  })

  const missedFollowUpMutation = useMutation({
    mutationFn: () => {
      if (!missedFollowUp) throw new Error("Follow-up is required to mark as missed.")

      return followUpsApi.markMissed(missedFollowUp.id)
    },
    onSuccess: () => {
      setMissedFollowUp(null)
      setFollowUpMessage(null)
      invalidateFollowUps()
      invalidateActivities()
    },
    onError: (error) => setFollowUpMessage(getFollowUpApiMessage(error, "Unable to mark follow-up as missed.")),
  })

  const openFollowUpDialog = () => {
    createFollowUpMutation.reset()
    setFollowUpMessage(null)
    setEmployeeSearch("")
    setFollowUpOpen(true)
  }

  const closeFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || createFollowUpMutation.isPending) return
    setFollowUpOpen(false)
    setFollowUpMessage(null)
  }

  const openEditFollowUpDialog = (followUp: FollowUp) => {
    updateFollowUpMutation.reset()
    setFollowUpMessage(null)
    setEditFollowUp(followUp)
  }

  const closeEditFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || updateFollowUpMutation.isPending) return
    setEditFollowUp(null)
    setFollowUpMessage(null)
  }

  const openAssignFollowUpDialog = (followUp: FollowUp) => {
    assignFollowUpMutation.reset()
    setFollowUpMessage(null)
    setAssignFollowUp(followUp)
  }

  const closeAssignFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || assignFollowUpMutation.isPending) return
    setAssignFollowUp(null)
    setFollowUpMessage(null)
  }

  const openCompleteFollowUpDialog = (followUp: FollowUp) => {
    completeFollowUpMutation.reset()
    setFollowUpMessage(null)
    setCompleteFollowUp(followUp)
  }

  const closeCompleteFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || completeFollowUpMutation.isPending) return
    setCompleteFollowUp(null)
    setFollowUpMessage(null)
  }

  const openRescheduleFollowUpDialog = (followUp: FollowUp) => {
    rescheduleFollowUpMutation.reset()
    setFollowUpMessage(null)
    setRescheduleFollowUp(followUp)
  }

  const closeRescheduleFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || rescheduleFollowUpMutation.isPending) return
    setRescheduleFollowUp(null)
    setFollowUpMessage(null)
  }

  const openCancelFollowUpDialog = (followUp: FollowUp) => {
    cancelFollowUpMutation.reset()
    setFollowUpMessage(null)
    setCancelFollowUp(followUp)
  }

  const closeCancelFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || cancelFollowUpMutation.isPending) return
    setCancelFollowUp(null)
    setFollowUpMessage(null)
  }

  const openReopenFollowUpDialog = (followUp: FollowUp) => {
    reopenFollowUpMutation.reset()
    setFollowUpMessage(null)
    setReopenFollowUp(followUp)
  }

  const closeReopenFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || reopenFollowUpMutation.isPending) return
    setReopenFollowUp(null)
    setFollowUpMessage(null)
  }

  const openMissedFollowUpDialog = (followUp: FollowUp) => {
    missedFollowUpMutation.reset()
    setFollowUpMessage(null)
    setMissedFollowUp(followUp)
  }

  const closeMissedFollowUpDialog = (nextOpen: boolean) => {
    if (nextOpen || missedFollowUpMutation.isPending) return
    setMissedFollowUp(null)
    setFollowUpMessage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="min-w-0 space-y-0.5">
              <DialogTitle className="truncate text-base font-semibold sm:text-lg">
                {lead?.leadNumber || "Lead details"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Complete lead information, files, notes, and recent activity.
              </DialogDescription>
            </div>
            {lead?.status ? (
              <Badge
                variant="outline"
                className={cn(
                  "h-6 shrink-0 rounded-full px-2.5 text-[11px] font-medium",
                  leadStatusBadgeClasses[lead.status] ?? "border-border bg-muted"
                )}
              >
                {getLeadStatusLabel(lead.status)}
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          {detailQuery.isLoading ? <LeadDetailSkeleton /> : null}

          {detailQuery.isError ? (
            <RetryAlert
              message={getLeadApiMessage(detailQuery.error, "Unable to load lead details.")}
              onRetry={() => detailQuery.refetch()}
            />
          ) : null}

          {lead ? (
            <>
              <LeadSummaryCard lead={lead} />
              <LeadContactsCard
                lead={lead}
                onAdd={() => setAddContactOpen(true)}
                onEdit={setEditContact}
                onRemove={setRemoveContactTarget}
              />
              <LeadServicesCard lead={lead} onAdd={() => setServiceOpen(true)} />
              <LeadAssignmentsCard
                assignments={assignmentsQuery.data?.data ?? []}
                isLoading={assignmentsQuery.isLoading}
                isError={assignmentsQuery.isError}
                error={assignmentsQuery.error}
                onRetry={() => assignmentsQuery.refetch()}
                onAssign={() => {
                  assignLeadMutation.reset()
                  setAssignLeadMessage(null)
                  setEmployeeSearch("")
                  setAssignLeadOpen(true)
                }}
              />
              <LeadFollowUpsCard
                followUps={followUps}
                isLoading={followUpsQuery.isLoading}
                isError={followUpsQuery.isError}
                error={followUpsQuery.error}
                onRetry={() => followUpsQuery.refetch()}
                onAdd={openFollowUpDialog}
                onView={setViewFollowUp}
                onEdit={openEditFollowUpDialog}
                onAssign={openAssignFollowUpDialog}
                onComplete={openCompleteFollowUpDialog}
                onReschedule={openRescheduleFollowUpDialog}
                onCancel={openCancelFollowUpDialog}
                onReopen={openReopenFollowUpDialog}
                onMarkMissed={openMissedFollowUpDialog}
              />
              <LeadNotesCard
                notes={notesQuery.data?.data ?? []}
                isLoading={notesQuery.isLoading}
                isError={notesQuery.isError}
                error={notesQuery.error}
                onRetry={() => notesQuery.refetch()}
                onAdd={() => setNoteOpen(true)}
                onEdit={setEditNote}
                onDelete={setDeleteNoteTarget}
              />
              <LeadAttachmentsCard
                attachments={attachmentsQuery.data?.data ?? []}
                isLoading={attachmentsQuery.isLoading}
                isError={attachmentsQuery.isError}
                error={attachmentsQuery.error}
                onRetry={() => attachmentsQuery.refetch()}
                onAdd={() => setAttachmentOpen(true)}
                onView={setViewAttachment}
                onDelete={setDeleteAttachment}
              />
              <LeadActivitiesCard
                activities={activitiesQuery.data?.data ?? []}
                isLoading={activitiesQuery.isLoading}
                isError={activitiesQuery.isError}
                error={activitiesQuery.error}
                onRetry={() => activitiesQuery.refetch()}
              />
            </>
          ) : null}
        </div>

        <AddLeadServiceDialog
          open={serviceOpen}
          leadId={leadId}
          existingServiceIds={lead?.services?.map((service) => service.id) ?? []}
          onOpenChange={setServiceOpen}
          onSuccess={() => {
            setServiceOpen(false)
            invalidateDetail()
            invalidateActivities()
          }}
        />
        <AddLeadNoteDialog
          open={noteOpen}
          leadId={leadId}
          onOpenChange={setNoteOpen}
          onSuccess={() => {
            setNoteOpen(false)
            void queryClient.invalidateQueries({ queryKey: ["leads", "notes", leadId] })
            invalidateActivities()
          }}
        />
        <EditLeadNoteDialog
          note={editNote}
          open={Boolean(editNote)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditNote(null)
          }}
          onSuccess={() => {
            setEditNote(null)
            void queryClient.invalidateQueries({ queryKey: ["leads", "notes", leadId] })
            invalidateActivities()
          }}
        />
        <DeleteLeadNoteDialog
          note={deleteNoteTarget}
          open={Boolean(deleteNoteTarget)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteNoteTarget(null)
          }}
          onSuccess={() => {
            setDeleteNoteTarget(null)
            void queryClient.invalidateQueries({ queryKey: ["leads", "notes", leadId] })
            invalidateActivities()
          }}
        />
        <AddLeadAttachmentDialog
          open={attachmentOpen}
          leadId={leadId}
          onOpenChange={setAttachmentOpen}
          onSuccess={() => {
            setAttachmentOpen(false)
            void queryClient.invalidateQueries({ queryKey: ["leads", "attachments", leadId] })
            invalidateActivities()
          }}
        />
        <AttachmentDetailDialog
          attachment={viewAttachment}
          open={Boolean(viewAttachment)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setViewAttachment(null)
          }}
        />
        <AttachmentDeleteDialog
          attachment={deleteAttachment}
          open={Boolean(deleteAttachment)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteAttachment(null)
          }}
          onSuccess={() => {
            setDeleteAttachment(null)
            void queryClient.invalidateQueries({ queryKey: ["leads", "attachments", leadId] })
            invalidateActivities()
          }}
        />
        <AddLeadContactDialog
          open={addContactOpen}
          leadId={leadId}
          existingContactIds={existingContactIds}
          onOpenChange={setAddContactOpen}
          onSuccess={() => {
            setAddContactOpen(false)
            invalidateDetail()
            invalidateActivities()
            invalidateContacts()
          }}
        />
        <EditLeadContactDialog
          contact={editContact}
          open={Boolean(editContact)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditContact(null)
          }}
          onSuccess={() => {
            setEditContact(null)
            invalidateDetail()
            invalidateActivities()
            invalidateContacts()
          }}
        />
        <RemoveLeadContactDialog
          leadId={leadId}
          contact={removeContactTarget}
          open={Boolean(removeContactTarget)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setRemoveContactTarget(null)
          }}
          onSuccess={() => {
            setRemoveContactTarget(null)
            invalidateDetail()
            invalidateActivities()
            invalidateContacts()
          }}
        />
        <LeadAssignDialog
          open={assignLeadOpen}
          lead={lead}
          employees={employees}
          isLoadingEmployees={employeesQuery.isLoading}
          isPending={assignLeadMutation.isPending}
          error={assignLeadMutation.error}
          message={assignLeadMessage}
          onEmployeeSearchChange={setEmployeeSearch}
          onOpenChange={(nextOpen) => {
            if (nextOpen || assignLeadMutation.isPending) return
            setAssignLeadOpen(false)
            setAssignLeadMessage(null)
            setEmployeeSearch("")
          }}
          onSubmit={(values) => {
            setAssignLeadMessage(null)
            assignLeadMutation.mutate(values)
          }}
        />
        <FollowUpDialog
          open={followUpOpen}
          isPending={createFollowUpMutation.isPending}
          error={createFollowUpMutation.error}
          message={followUpMessage}
          leadId={leadId ?? undefined}
          leadLabel={lead ? getLeadTitle(lead) : undefined}
          employees={employees}
          isLoadingEmployees={employeesQuery.isLoading}
          onEmployeeSearchChange={setEmployeeSearch}
          onOpenChange={closeFollowUpDialog}
          onSubmit={(values) => {
            setFollowUpMessage(null)
            createFollowUpMutation.mutate(values)
          }}
        />
        <FollowUpEditDialog
          open={Boolean(editFollowUp)}
          followUp={editFollowUp}
          isPending={updateFollowUpMutation.isPending}
          error={updateFollowUpMutation.error}
          message={followUpMessage}
          employees={employees}
          isLoadingEmployees={employeesQuery.isLoading}
          onEmployeeSearchChange={setEmployeeSearch}
          onOpenChange={closeEditFollowUpDialog}
          onSubmit={(values) => {
            setFollowUpMessage(null)
            updateFollowUpMutation.mutate(values)
          }}
        />
        <FollowUpDetailDialog
          open={Boolean(viewFollowUp)}
          followUp={viewFollowUp}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setViewFollowUp(null)
          }}
        />
        <FollowUpAssignDialog
          open={Boolean(assignFollowUp)}
          followUp={assignFollowUp}
          isPending={assignFollowUpMutation.isPending}
          error={assignFollowUpMutation.error}
          message={followUpMessage}
          employees={employees}
          isLoadingEmployees={employeesQuery.isLoading}
          onEmployeeSearchChange={setEmployeeSearch}
          onOpenChange={closeAssignFollowUpDialog}
          onSubmit={(values) => {
            setFollowUpMessage(null)
            assignFollowUpMutation.mutate(values)
          }}
        />
        <FollowUpCompleteDialog
          open={Boolean(completeFollowUp)}
          followUp={completeFollowUp}
          isPending={completeFollowUpMutation.isPending}
          error={completeFollowUpMutation.error}
          message={followUpMessage}
          onOpenChange={closeCompleteFollowUpDialog}
          onSubmit={(values) => {
            setFollowUpMessage(null)
            completeFollowUpMutation.mutate(values)
          }}
        />
        <FollowUpRescheduleDialog
          open={Boolean(rescheduleFollowUp)}
          followUp={rescheduleFollowUp}
          isPending={rescheduleFollowUpMutation.isPending}
          error={rescheduleFollowUpMutation.error}
          message={followUpMessage}
          onOpenChange={closeRescheduleFollowUpDialog}
          onSubmit={(values) => {
            setFollowUpMessage(null)
            rescheduleFollowUpMutation.mutate(values)
          }}
        />
        <FollowUpConfirmDialog
          mode="cancel"
          open={Boolean(cancelFollowUp)}
          followUp={cancelFollowUp}
          isPending={cancelFollowUpMutation.isPending}
          message={followUpMessage}
          onOpenChange={closeCancelFollowUpDialog}
          onConfirm={(reason) => {
            setFollowUpMessage(null)
            cancelFollowUpMutation.mutate(reason)
          }}
        />
        <FollowUpConfirmDialog
          mode="reopen"
          open={Boolean(reopenFollowUp)}
          followUp={reopenFollowUp}
          isPending={reopenFollowUpMutation.isPending}
          message={followUpMessage}
          onOpenChange={closeReopenFollowUpDialog}
          onConfirm={(reason) => {
            setFollowUpMessage(null)
            reopenFollowUpMutation.mutate(reason)
          }}
        />
        <FollowUpConfirmDialog
          mode="missed"
          open={Boolean(missedFollowUp)}
          followUp={missedFollowUp}
          isPending={missedFollowUpMutation.isPending}
          message={followUpMessage}
          onOpenChange={closeMissedFollowUpDialog}
          onConfirm={() => {
            setFollowUpMessage(null)
            missedFollowUpMutation.mutate()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function LeadSummaryCard({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="min-w-0 space-y-1.5">
          <h2 className="break-words text-base font-semibold leading-tight">{getLeadTitle(lead)}</h2>
          <p className="max-w-2xl break-words text-sm leading-6 text-muted-foreground">
            {formatDescription(lead.summary || "No summary available.")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-52">
          <MetricBadge
            label="Priority"
            value={getLeadPriorityLabel(lead.priority)}
            className={leadPriorityBadgeClasses[lead.priority ?? ""] ?? "border-border bg-muted"}
          />
          <MetricBadge
            label="Qualification"
            value={getLeadQualificationLabel(lead.qualification)}
            className={leadQualificationBadgeClasses[lead.qualification ?? ""] ?? "border-border bg-muted"}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <InfoItem
          icon={WalletCards}
          label="Budget Range"
          value={formatBudget(lead.budgetMin, lead.budgetMax)}
        />
        <InfoItem icon={Calendar} label="Expected Closing" value={formatLeadDate(lead.expectedClosingDate)} />
        <InfoItem icon={UserRound} label="Owner" value={getLeadOwnerName(lead)} />
        <InfoItem icon={Globe2} label="Source" value={getLeadSourceName(lead)} />
      </div>
    </section>
  )
}

function LeadContactsCard({
  lead,
  onAdd,
  onEdit,
  onRemove,
}: {
  lead: Lead
  onAdd: () => void
  onEdit: (contact: LeadContact) => void
  onRemove: (contact: LeadContact) => void
}) {
  const contacts = lead.contacts?.length ? lead.contacts : lead.primaryContact ? [lead.primaryContact] : []

  return (
    <DetailSection title="Contacts" actionLabel="Add Contact" onAdd={onAdd}>
      {contacts.length ? (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex flex-col gap-2.5 rounded-lg border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {formatDisplayName(contact.fullName || "C").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {formatDisplayName(contact.fullName || contact.id)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{formatDesignation(contact.designation)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground sm:items-end">
                  {contact.primaryPhone ? (
                    <span className="inline-flex items-center gap-1.5 break-all">
                      <Phone className="size-3.5 shrink-0" />
                      {formatPhoneNumber(contact.primaryPhone)}
                    </span>
                  ) : null}
                  {contact.primaryEmail ? (
                    <span className="inline-flex items-center gap-1.5 break-all">
                      <Mail className="size-3.5 shrink-0" />
                      {formatEmail(contact.primaryEmail)}
                    </span>
                  ) : null}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Open contact actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        onEdit(contact)
                      }}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(event) => {
                        event.preventDefault()
                        onRemove(contact)
                      }}
                    >
                      <UserMinus className="size-4" />
                      Remove from lead
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyText>No contacts linked.</EmptyText>
      )}
    </DetailSection>
  )
}

function LeadServicesCard({ lead, onAdd }: { lead: Lead; onAdd: () => void }) {
  return (
    <DetailSection title="Services" actionLabel="Add Service" onAdd={onAdd}>
      {lead.services?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {lead.services.map((service) => (
            <Badge
              key={service.id}
              variant="outline"
              className="gap-1.5 rounded-md border-border bg-background px-2.5 py-1 text-xs font-medium"
            >
              {formatTitleCase(service.label || service.name || service.id)}
              <span className="size-1.5 rounded-full bg-primary" />
            </Badge>
          ))}
        </div>
      ) : (
        <EmptyText>No services linked.</EmptyText>
      )}
    </DetailSection>
  )
}

function LeadAssignmentsCard({
  assignments,
  isLoading,
  isError,
  error,
  onRetry,
  onAssign,
}: {
  assignments: LeadAssignment[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAssign: () => void
}) {
  return (
    <DetailSection title="Assignment History" actionLabel="Assign Lead" onAdd={onAssign}>
      <SectionState
        isLoading={isLoading}
        isError={isError}
        error={error}
        fallback="Unable to load assignment history."
        onRetry={onRetry}
      />
      {!isLoading && !isError && assignments.length ? (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCog className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {formatDisplayName(assignment.assignedTo?.name || "Unassigned")}
                </p>
                {assignment.reason ? (
                  <p className="line-clamp-2 break-words text-xs text-muted-foreground">
                    {formatDescription(assignment.reason)}
                  </p>
                ) : null}
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {[
                    assignment.assignedBy?.name ? `By ${formatDisplayName(assignment.assignedBy.name)}` : null,
                    formatLeadDate(assignment.assignedAt),
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !assignments.length ? <EmptyText>No assignment history.</EmptyText> : null}
    </DetailSection>
  )
}

function LeadFollowUpsCard({
  followUps,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onReschedule,
  onCancel,
  onReopen,
  onMarkMissed,
}: {
  followUps: FollowUp[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onView: (followUp: FollowUp) => void
  onEdit: (followUp: FollowUp) => void
  onAssign: (followUp: FollowUp) => void
  onComplete: (followUp: FollowUp) => void
  onReschedule: (followUp: FollowUp) => void
  onCancel: (followUp: FollowUp) => void
  onReopen: (followUp: FollowUp) => void
  onMarkMissed: (followUp: FollowUp) => void
}) {
  return (
    <DetailSection title="Follow-Ups" actionLabel="Schedule Follow-Up" onAdd={onAdd}>
      <SectionState
        isLoading={isLoading}
        isError={isError}
        error={error}
        fallback="Unable to load follow-ups."
        onRetry={onRetry}
      />
      {!isLoading && !isError && followUps.length ? (
        <div className="space-y-2">
          {followUps.map((followUp) => (
            <div
              key={followUp.id}
              className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {followUp.followUpNumber ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatCode(followUp.followUpNumber)}
                    </span>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap px-2 py-0.5 font-normal",
                      followUpTypeBadgeClasses[followUp.type] ?? "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {getFollowUpTypeLabel(followUp.type, followUp.customType)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap px-2 py-0.5 font-normal",
                      followUpStatusBadgeClasses[followUp.status] ?? "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {getFollowUpStatusLabel(followUp.status)}
                  </Badge>
                  {followUp.outcome ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "whitespace-nowrap px-2 py-0.5 font-normal",
                        followUpOutcomeBadgeClasses[followUp.outcome] ?? "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {getFollowUpOutcomeLabel(followUp.outcome)}
                    </Badge>
                  ) : null}
                  {followUp.isOverdue ? (
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                      Overdue
                    </Badge>
                  ) : null}
                </div>
                {followUp.notes ? (
                  <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm font-medium">
                    {followUp.notes}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    {formatFollowUpDateTime(followUp.scheduledAt)}
                  </span>
                  <span>{getFollowUpAssigneeName(followUp)}</span>
                  {followUp.status === "COMPLETED" && followUp.completedAt ? (
                    <span>Completed {formatFollowUpDateTime(followUp.completedAt)}</span>
                  ) : null}
                  {followUp.completedBy?.name ? (
                    <span>by {formatDisplayName(followUp.completedBy.name)}</span>
                  ) : null}
                </div>
                {followUp.primaryContact?.fullName || followUp.companyName ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {followUp.primaryContact?.fullName ? (
                      <span>
                        {getFollowUpContactName(followUp)}
                        {followUp.primaryContact?.designation
                          ? ` · ${formatDesignation(followUp.primaryContact.designation)}`
                          : ""}
                      </span>
                    ) : null}
                    {followUp.companyName ? <span>{followUp.companyName}</span> : null}
                  </div>
                ) : null}
              </div>
              <FollowUpActionsMenu
                followUp={followUp}
                onView={onView}
                onEdit={onEdit}
                onAssign={onAssign}
                onComplete={onComplete}
                onReschedule={onReschedule}
                onCancel={onCancel}
                onReopen={onReopen}
                onMarkMissed={onMarkMissed}
              />
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !followUps.length ? <EmptyText>No follow-ups scheduled.</EmptyText> : null}
    </DetailSection>
  )
}

function LeadNotesCard({
  notes,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
}: {
  notes: LeadNote[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onEdit: (note: LeadNote) => void
  onDelete: (note: LeadNote) => void
}) {
  return (
    <DetailSection title="Notes" actionLabel="Add Note" onAdd={onAdd}>
      <SectionState
        isLoading={isLoading}
        isError={isError}
        error={error}
        fallback="Unable to load notes."
        onRetry={onRetry}
      />
      {!isLoading && !isError && notes.length ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <NotebookText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm font-medium">{note.content}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{[note.createdBy?.name, formatLeadDate(note.createdAt)].filter(Boolean).join(" · ")}</span>
                  {note.visibility ? (
                    <Badge variant="outline" className="h-5 gap-1 rounded-full px-2 text-[10px] font-medium">
                      {note.visibility === "PRIVATE" ? (
                        <Lock className="size-3" />
                      ) : (
                        <Users className="size-3" />
                      )}
                      {formatTitleCase(note.visibility)}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label="Open note actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      onEdit(note)
                    }}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(event) => {
                      event.preventDefault()
                      onDelete(note)
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !notes.length ? <EmptyText>No notes available.</EmptyText> : null}
    </DetailSection>
  )
}

function LeadAttachmentsCard({
  attachments,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onView,
  onDelete,
}: {
  attachments: LeadAttachment[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onView: (attachment: LeadAttachment) => void
  onDelete: (attachment: LeadAttachment) => void
}) {
  return (
    <DetailSection title="Attachments" actionLabel="Add Attachment" onAdd={onAdd}>
      <SectionState
        isLoading={isLoading}
        isError={isError}
        error={error}
        fallback="Unable to load attachments."
        onRetry={onRetry}
      />
      {!isLoading && !isError && attachments.length ? (
        <div className="divide-y divide-border rounded-lg border border-border/70">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 transition hover:bg-muted/50">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
                onClick={() => onView(attachment)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Paperclip className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-all text-sm font-medium">{attachment.fileName}</p>
                  <p className="break-words text-xs text-muted-foreground">
                    {[formatFileSize(attachment.fileSize), attachment.mimeType, formatLeadDate(attachment.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Open attachment actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      onView(attachment)
                    }}
                  >
                    <Eye className="size-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(event) => {
                      event.preventDefault()
                      onDelete(attachment)
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !attachments.length ? <EmptyText>No attachments available.</EmptyText> : null}
    </DetailSection>
  )
}

function LeadActivitiesCard({
  activities,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  activities: LeadActivity[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}) {
  return (
    <DetailSection title="Activity Timeline">
      <SectionState
        isLoading={isLoading}
        isError={isError}
        error={error}
        fallback="Unable to load activity timeline."
        onRetry={onRetry}
      />
      {!isLoading && !isError && activities.length ? (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="size-3.5" />
                </span>
                {index < activities.length - 1 ? <span className="h-full w-px bg-border" /> : null}
              </div>
              <div className="min-w-0 flex-1 pb-3">
                <p className="break-words text-sm font-medium">{formatActivityType(activity.type)}</p>
                <p className="break-words text-xs text-muted-foreground">
                  {[activity.performedBy?.name, formatLeadDate(activity.createdAt)].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !activities.length ? <EmptyText>No activity available.</EmptyText> : null}
    </DetailSection>
  )
}

function DetailSection({
  title,
  actionLabel,
  onAdd,
  children,
}: {
  title: string
  actionLabel?: string
  onAdd?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {actionLabel && onAdd ? (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onAdd}>
            <Plus className="size-3.5" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function LeadAssignDialog({
  open,
  lead,
  employees,
  isLoadingEmployees,
  isPending,
  error,
  message,
  onEmployeeSearchChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  lead: Lead | null
  employees: Employee[]
  isLoadingEmployees: boolean
  isPending: boolean
  error: unknown
  message: string | null
  onEmployeeSearchChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadAssignFormValues) => void
}) {
  const form = useForm<LeadAssignFormValues>({
    resolver: zodResolver(leadAssignSchema),
    defaultValues: {
      employeeId: "",
      reason: "",
    },
  })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset({
      employeeId: "",
      reason: "",
    })
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, leadAssignFields)
  }, [error, form])

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label:
          employee.displayName ||
          `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
          employee.email ||
          employee.id,
      })),
    [employees]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>
            Assign {lead ? getLeadTitle(lead) : "this lead"} to a team member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl className="mt-2">
                    <SearchableSelect
                      value={field.value}
                      options={employeeOptions}
                      placeholder={isLoadingEmployees ? "Loading employees" : "Select employee"}
                      searchPlaceholder="Search employees..."
                      disabled={isPending || isLoadingEmployees}
                      onSearchChange={onEmployeeSearchChange}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea placeholder="Why is this lead being assigned?" disabled={isPending} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Assign Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function AddLeadServiceDialog({
  open,
  leadId,
  existingServiceIds,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  leadId: string | null
  existingServiceIds: string[]
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [serviceId, setServiceId] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const servicesQuery = useQuery({
    queryKey: ["services", "lead-detail-options", serviceSearch],
    queryFn: () => servicesApi.list({ page: 1, limit: 20, search: serviceSearch || undefined }),
    enabled: open && serviceSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
  const serviceOptions = useMemo(
    () =>
      (servicesQuery.data?.data.services ?? [])
        .filter((service) => !existingServiceIds.includes(service.id))
        .map((service) => ({
          value: service.id,
          label: service.label || service.name || service.id,
        })),
    [existingServiceIds, servicesQuery.data?.data.services]
  )
  const mutation = useMutation({
    mutationFn: () => {
      if (!leadId || !serviceId) throw new Error("Select a service first.")

      return leadsApi.addService(leadId, { serviceId })
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to add service.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => {
      setServiceId("")
      setServiceSearch("")
      setMessage(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>Attach one more service to this lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {message ? <Alert variant="destructive">{message}</Alert> : null}
          <SearchableSelect
            value={serviceId}
            options={serviceOptions}
            placeholder={servicesQuery.isLoading ? "Loading services" : "Select service"}
            searchPlaceholder="Search services..."
            disabled={servicesQuery.isLoading || mutation.isPending}
            onSearchChange={setServiceSearch}
            onChange={setServiceId}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!serviceId || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const noteSchema = z.object({
  content: z.string().trim().min(1, "Note is required"),
  visibility: z.enum(["TEAM", "PRIVATE"]),
})

const noteVisibilityOptions: Array<{ value: "TEAM" | "PRIVATE"; label: string; icon: typeof Users }> = [
  { value: "TEAM", label: "Team", icon: Users },
  { value: "PRIVATE", label: "Private", icon: Lock },
]

function AddLeadNoteDialog({
  open,
  leadId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  leadId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "", visibility: "TEAM" },
  })
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof noteSchema>) => {
      if (!leadId) throw new Error("Lead is required.")

      return leadsApi.createNote({
        resourceType: "LEAD",
        resourceId: leadId,
        content: values.content,
        visibility: values.visibility,
      })
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to add note.")),
  })

  useEffect(() => {
    if (!open) return
    form.reset({ content: "", visibility: "TEAM" })
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a note to this lead.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea rows={5} placeholder="Write note..." disabled={mutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select disabled={mutation.isPending} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {noteVisibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <option.icon className="size-3.5" />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function AddLeadAttachmentDialog({
  open,
  leadId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  leadId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!leadId || !file) throw new Error("Select a file first.")

      return leadsApi.createAttachment({
        resourceType: "LEAD",
        resourceId: leadId,
        file,
        fileName: fileName.trim() || undefined,
      })
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to upload attachment.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => {
      setFile(null)
      setFileName("")
      setMessage(null)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
          <DialogDescription>Upload a file and link it to this lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {message ? <Alert variant="destructive">{message}</Alert> : null}
          <div className="space-y-2">
            <label className="text-sm font-medium">File</label>
            <Input
              type="file"
              disabled={mutation.isPending}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Display name</label>
            <Input
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder={file?.name || "Optional display name"}
              disabled={mutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!file || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AttachmentDetailDialog({
  attachment,
  open,
  onOpenChange,
}: {
  attachment: LeadAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useQuery({
    queryKey: ["attachments", "detail", attachment?.id],
    queryFn: () => leadsApi.attachmentDetail(attachment?.id as string),
    enabled: open && Boolean(attachment?.id),
  })
  const detail = detailQuery.data?.data ?? attachment
  const fileUrl = detail ? getAttachmentUrl(detail) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attachment Details</DialogTitle>
          <DialogDescription>Review attachment metadata for this lead.</DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}

        {detailQuery.isError ? (
          <RetryAlert
            message={getLeadApiMessage(detailQuery.error, "Unable to load attachment details.")}
            onRetry={() => detailQuery.refetch()}
          />
        ) : null}

        {detail ? (
          <div className="space-y-4 rounded-lg border border-border/70 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Paperclip className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="break-all text-sm font-semibold">{detail.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {[formatFileSize(detail.fileSize), detail.mimeType].filter(Boolean).join(" · ") || "Metadata only"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetadataItem label="Uploaded by" value={detail.uploadedBy?.name || "-"} />
              <MetadataItem label="Created" value={formatLeadDate(detail.createdAt)} />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {fileUrl ? (
            <Button type="button" asChild>
              <a href={fileUrl} target="_blank" rel="noreferrer">
                Open File
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AttachmentDeleteDialog({
  attachment,
  open,
  onOpenChange,
  onSuccess,
}: {
  attachment: LeadAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!attachment) throw new Error("Attachment is required.")

      return leadsApi.deleteAttachment(attachment.id)
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to delete attachment.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete attachment?</DialogTitle>
          <DialogDescription>
            This will remove {attachment?.fileName ? `"${attachment.fileName}"` : "this attachment"} from the lead.
          </DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditLeadNoteDialog({
  note,
  open,
  onOpenChange,
  onSuccess,
}: {
  note: LeadNote | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "", visibility: "TEAM" },
  })
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof noteSchema>) => {
      if (!note) throw new Error("Note is required.")

      return leadsApi.updateNote(note.id, {
        content: values.content,
        visibility: values.visibility,
      })
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to update note.")),
  })

  useEffect(() => {
    if (!open || !note) return
    form.reset({
      content: note.content ?? "",
      visibility: note.visibility === "PRIVATE" ? "PRIVATE" : "TEAM",
    })
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [form, note, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Update the note content or visibility.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl className="mt-2">
                    <Textarea rows={5} placeholder="Write note..." disabled={mutation.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select disabled={mutation.isPending} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {noteVisibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <option.icon className="size-3.5" />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteLeadNoteDialog({
  note,
  open,
  onOpenChange,
  onSuccess,
}: {
  note: LeadNote | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!note) throw new Error("Note is required.")

      return leadsApi.deleteNote(note.id)
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to delete note.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete note?</DialogTitle>
          <DialogDescription>This will remove this note from the lead.</DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddLeadContactDialog({
  open,
  leadId,
  existingContactIds,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  leadId: string | null
  existingContactIds: string[]
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [contactId, setContactId] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [contactSearch, setContactSearch] = useState("")
  const contactsQuery = useQuery({
    queryKey: ["contacts", "lead-detail-options", contactSearch],
    queryFn: () => contactsApi.list({ page: 1, limit: 20, search: contactSearch || undefined }),
    enabled: open && !createOpen && contactSearch.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
  const contactOptions = useMemo(
    () =>
      (contactsQuery.data?.data.contacts ?? [])
        .filter((contact) => !existingContactIds.includes(contact.id))
        .map((contact) => ({
          value: contact.id,
          label: getContactName(contact),
        })),
    [contactsQuery.data?.data.contacts, existingContactIds]
  )
  const mutation = useMutation({
    mutationFn: (input: { contactId?: string; newContact?: LeadNewContactLinkInput }) => {
      if (!leadId) throw new Error("Lead is required.")
      if (!input.contactId && !input.newContact) throw new Error("Select or add a contact first.")

      return leadsApi.addContact(leadId, { ...input, isPrimary })
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to add contact.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => {
      setContactId("")
      setContactSearch("")
      setIsPrimary(false)
      setMessage(null)
      setCreateOpen(false)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  const handleCreateContact = (values: LeadContactFormValues) => {
    mutation.mutate({
      newContact: {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        designation: values.designation || undefined,
        phones: values.phones,
        emails: values.emails,
      },
    })
  }

  return (
    <>
      <Dialog open={open && !createOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Link an existing contact to this lead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            <SearchableSelect
              value={contactId}
              options={contactOptions}
              placeholder={contactsQuery.isLoading ? "Loading contacts" : "Select contact"}
              searchPlaceholder="Search contacts..."
              disabled={contactsQuery.isLoading || mutation.isPending}
              onSearchChange={setContactSearch}
              onChange={setContactId}
            />
            <p className="text-xs text-muted-foreground">
              Can&apos;t find the contact?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:underline"
                disabled={mutation.isPending}
                onClick={() => {
                  setMessage(null)
                  setCreateOpen(true)
                }}
              >
                Add a new contact
              </button>
              .
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Set as primary contact</p>
                <p className="text-xs text-muted-foreground">This contact will be marked as the lead&apos;s primary contact.</p>
              </div>
              <Switch checked={isPrimary} onCheckedChange={setIsPrimary} disabled={mutation.isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!contactId || mutation.isPending}
              onClick={() => mutation.mutate({ contactId })}
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LeadContactDialog
        open={open && createOpen}
        isPending={mutation.isPending}
        message={message}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setCreateOpen(false)
            setMessage(null)
          }
        }}
        onSubmit={handleCreateContact}
      />
    </>
  )
}

function EditLeadContactDialog({
  contact,
  open,
  onOpenChange,
  onSuccess,
}: {
  contact: LeadContact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (values: ContactProfileFormValues) => {
      if (!contact) throw new Error("Contact is required.")

      return contactsApi.update(contact.id, {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        designation: values.designation || undefined,
      })
    },
    onSuccess,
    onError: (error) => setMessage(getContactApiMessage(error, "Unable to update contact.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <ContactProfileDialog
      open={open}
      contact={contact}
      isPending={mutation.isPending}
      error={mutation.error}
      message={message}
      onOpenChange={onOpenChange}
      onSubmit={(values) => mutation.mutate(values)}
    />
  )
}

function RemoveLeadContactDialog({
  leadId,
  contact,
  open,
  onOpenChange,
  onSuccess,
}: {
  leadId: string | null
  contact: LeadContact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!leadId || !contact) throw new Error("Contact is required.")

      return leadsApi.removeContact(leadId, contact.id)
    },
    onSuccess,
    onError: (error) => setMessage(getLeadApiMessage(error, "Unable to remove contact.")),
  })

  useEffect(() => {
    if (!open) return
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove contact from lead?</DialogTitle>
          <DialogDescription>
            {contact ? `"${formatDisplayName(contact.fullName || contact.id)}"` : "This contact"} will be unlinked
            from this lead. The contact profile itself will not be deleted.
          </DialogDescription>
        </DialogHeader>

        {message ? <Alert variant="destructive">{message}</Alert> : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MetricBadge({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <Badge
        variant="outline"
        className={cn("w-full justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold", className)}
      >
        {value}
      </Badge>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function SectionState({
  isLoading,
  isError,
  error,
  fallback,
  onRetry,
}: {
  isLoading: boolean
  isError: boolean
  error: unknown
  fallback: string
  onRetry: () => void
}) {
  if (isLoading) return <Skeleton className="h-16 w-full" />
  if (!isError) return null

  return <RetryAlert message={getLeadApiMessage(error, fallback)} onRetry={onRetry} />
}

function RetryAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </Alert>
  )
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

function LeadDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  )
}

const formatActivityType = (value: string) =>
  value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())

const formatFileSize = (value?: number) => {
  if (!value) return ""
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  )
}

const getAttachmentUrl = (attachment: LeadAttachment) => {
  return attachment.downloadUrl ?? attachment.fileUrl ?? attachment.url ?? null
}
