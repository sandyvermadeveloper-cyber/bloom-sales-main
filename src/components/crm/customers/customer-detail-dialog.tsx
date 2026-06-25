"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Calendar,
  Eye,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  NotebookText,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCog,
  UserMinus,
  UserRound,
} from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { contactsApi } from "@/api/contacts.api"
import { customersApi } from "@/api/customers.api"
import { ContactProfileDialog } from "@/components/crm/contacts/contact-profile-dialog"
import { getContactApiMessage, getContactName } from "@/components/crm/contacts/contacts.utils"
import { CustomerContactDialog, type CustomerContactFormValues } from "@/components/crm/customers/customer-contact-dialog"
import {
  customerStatusBadgeClasses,
  customerTypeBadgeClasses,
} from "@/components/crm/customers/customers.constants"
import {
  formatCustomerDate,
  getCustomerApiMessage,
  getCustomerName,
  getCustomerOwnerName,
  getCustomerStatusLabel,
  getCustomerTypeLabel,
} from "@/components/crm/customers/customers.utils"
import { SearchableSelect } from "@/components/crm/leads/lead-searchable-select"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ContactProfileFormValues } from "@/schemas/contact.schemas"
import type {
  Customer,
  CustomerActivity,
  CustomerAssignment,
  CustomerAttachment,
  CustomerContact,
  CustomerNewContactLinkInput,
  CustomerNote,
} from "@/types/customer"
import {
  formatDesignation,
  formatDisplayName,
  formatEmail,
  formatPhoneNumber,
  formatTitleCase,
} from "@/utils/display-format"

type CustomerDetailDialogProps = {
  customerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailDialog({ customerId, open, onOpenChange }: CustomerDetailDialogProps) {
  const queryClient = useQueryClient()
  const [noteOpen, setNoteOpen] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [viewAttachment, setViewAttachment] = useState<CustomerAttachment | null>(null)
  const [deleteAttachment, setDeleteAttachment] = useState<CustomerAttachment | null>(null)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [editContact, setEditContact] = useState<CustomerContact | null>(null)
  const [removeContactTarget, setRemoveContactTarget] = useState<CustomerContact | null>(null)

  const detailQuery = useQuery({
    queryKey: ["customers", "detail", customerId],
    queryFn: () => customersApi.detail(customerId as string),
    enabled: open && Boolean(customerId),
  })
  const activitiesQuery = useQuery({
    queryKey: ["customers", "activities", customerId],
    queryFn: () => customersApi.activities(customerId as string),
    enabled: open && Boolean(customerId),
  })
  const notesQuery = useQuery({
    queryKey: ["customers", "notes", customerId],
    queryFn: () => customersApi.notes(customerId as string),
    enabled: open && Boolean(customerId),
  })
  const attachmentsQuery = useQuery({
    queryKey: ["customers", "attachments", customerId],
    queryFn: () => customersApi.attachments(customerId as string),
    enabled: open && Boolean(customerId),
  })
  const assignmentsQuery = useQuery({
    queryKey: ["customers", "assignments", customerId],
    queryFn: () => customersApi.assignments(customerId as string),
    enabled: open && Boolean(customerId),
  })

  const customer = detailQuery.data?.data ?? null

  const existingContacts = customer?.contacts?.length
    ? customer.contacts
    : customer?.primaryContact
      ? [customer.primaryContact]
      : []
  const existingContactIds = existingContacts.map((contact) => contact.id)

  const invalidateDetail = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers", "detail", customerId] })
    void queryClient.invalidateQueries({ queryKey: ["customers"] })
  }
  const invalidateActivities = () => {
    void queryClient.invalidateQueries({ queryKey: ["customers", "activities", customerId] })
  }
  const invalidateContacts = () => {
    void queryClient.invalidateQueries({ queryKey: ["contacts"] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="min-w-0 space-y-0.5">
              <DialogTitle className="truncate text-base font-semibold sm:text-lg">
                {customer?.customerNumber || "Customer details"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Complete customer information, contacts, notes, and recent activity.
              </DialogDescription>
            </div>
            {customer?.status ? (
              <Badge
                variant="outline"
                className={cn(
                  "h-6 shrink-0 rounded-full px-2.5 text-[11px] font-medium",
                  customerStatusBadgeClasses[customer.status] ?? "border-border bg-muted"
                )}
              >
                {getCustomerStatusLabel(customer.status)}
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          {detailQuery.isLoading ? <CustomerDetailSkeleton /> : null}

          {detailQuery.isError ? (
            <RetryAlert
              message={getCustomerApiMessage(detailQuery.error, "Unable to load customer details.")}
              onRetry={() => detailQuery.refetch()}
            />
          ) : null}

          {customer ? (
            <>
              <CustomerSummaryCard customer={customer} />
              <CustomerContactsCard
                contacts={existingContacts}
                onAdd={() => setAddContactOpen(true)}
                onEdit={setEditContact}
                onRemove={setRemoveContactTarget}
              />
              <CustomerAssignmentsCard
                assignments={assignmentsQuery.data?.data ?? []}
                isLoading={assignmentsQuery.isLoading}
                isError={assignmentsQuery.isError}
                error={assignmentsQuery.error}
                onRetry={() => assignmentsQuery.refetch()}
              />
              <CustomerNotesCard
                notes={notesQuery.data?.data ?? []}
                isLoading={notesQuery.isLoading}
                isError={notesQuery.isError}
                error={notesQuery.error}
                onRetry={() => notesQuery.refetch()}
                onAdd={() => setNoteOpen(true)}
              />
              <CustomerAttachmentsCard
                attachments={attachmentsQuery.data?.data ?? []}
                isLoading={attachmentsQuery.isLoading}
                isError={attachmentsQuery.isError}
                error={attachmentsQuery.error}
                onRetry={() => attachmentsQuery.refetch()}
                onAdd={() => setAttachmentOpen(true)}
                onView={setViewAttachment}
                onDelete={setDeleteAttachment}
              />
              <CustomerActivitiesCard
                activities={activitiesQuery.data?.data ?? []}
                isLoading={activitiesQuery.isLoading}
                isError={activitiesQuery.isError}
                error={activitiesQuery.error}
                onRetry={() => activitiesQuery.refetch()}
              />
            </>
          ) : null}
        </div>

        <AddCustomerNoteDialog
          open={noteOpen}
          customerId={customerId}
          onOpenChange={setNoteOpen}
          onSuccess={() => {
            setNoteOpen(false)
            void queryClient.invalidateQueries({ queryKey: ["customers", "notes", customerId] })
            invalidateActivities()
          }}
        />
        <AddCustomerAttachmentDialog
          open={attachmentOpen}
          customerId={customerId}
          onOpenChange={setAttachmentOpen}
          onSuccess={() => {
            setAttachmentOpen(false)
            void queryClient.invalidateQueries({ queryKey: ["customers", "attachments", customerId] })
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
            void queryClient.invalidateQueries({ queryKey: ["customers", "attachments", customerId] })
            invalidateActivities()
          }}
        />
        <AddCustomerContactDialog
          open={addContactOpen}
          customerId={customerId}
          existingContactIds={existingContactIds}
          onOpenChange={setAddContactOpen}
          onSuccess={() => {
            setAddContactOpen(false)
            invalidateDetail()
            invalidateActivities()
            invalidateContacts()
          }}
        />
        <EditCustomerContactDialog
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
        <RemoveCustomerContactDialog
          customerId={customerId}
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
      </DialogContent>
    </Dialog>
  )
}

function CustomerSummaryCard({ customer }: { customer: Customer }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold leading-tight">{getCustomerName(customer)}</h2>
          <p className="font-mono text-xs text-muted-foreground">
            {customer.customerNumber || customer.id}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-52">
          <MetricBadge
            label="Type"
            value={getCustomerTypeLabel(customer.customerType)}
            className={customerTypeBadgeClasses[customer.customerType ?? ""] ?? "border-border bg-muted"}
          />
          <MetricBadge
            label="Status"
            value={getCustomerStatusLabel(customer.status)}
            className={customerStatusBadgeClasses[customer.status ?? ""] ?? "border-border bg-muted"}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <InfoItem icon={UserRound} label="Owner" value={getCustomerOwnerName(customer)} />
        <InfoItem icon={Calendar} label="Created" value={formatCustomerDate(customer.createdAt)} />
      </div>
    </section>
  )
}

function CustomerContactsCard({
  contacts,
  onAdd,
  onEdit,
  onRemove,
}: {
  contacts: CustomerContact[]
  onAdd: () => void
  onEdit: (contact: CustomerContact) => void
  onRemove: (contact: CustomerContact) => void
}) {
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
                    {contact.isPrimary ? (
                      <Badge variant="secondary" className="ml-2 align-middle text-[10px]">
                        Primary
                      </Badge>
                    ) : null}
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
                      Remove from customer
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

function CustomerAssignmentsCard({
  assignments,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  assignments: CustomerAssignment[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}) {
  return (
    <DetailSection title="Assignment History">
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
              className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCog className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {formatTitleCase(assignment.assignedTo?.name || "Unassigned")}
                </p>
                {assignment.reason ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{assignment.reason}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    assignment.assignedBy?.name ? `By ${formatTitleCase(assignment.assignedBy.name)}` : null,
                    formatCustomerDate(assignment.assignedAt),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
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

function CustomerNotesCard({
  notes,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
}: {
  notes: CustomerNote[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
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
            <div key={note.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <NotebookText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{note.content}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[note.createdBy?.name, formatCustomerDate(note.createdAt)].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !isError && !notes.length ? <EmptyText>No notes available.</EmptyText> : null}
    </DetailSection>
  )
}

function CustomerAttachmentsCard({
  attachments,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onView,
  onDelete,
}: {
  attachments: CustomerAttachment[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onView: (attachment: CustomerAttachment) => void
  onDelete: (attachment: CustomerAttachment) => void
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
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => onView(attachment)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Paperclip className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[formatFileSize(attachment.fileSize), attachment.mimeType, formatCustomerDate(attachment.createdAt)]
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

function CustomerActivitiesCard({
  activities,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  activities: CustomerActivity[]
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
              <div className="pb-3">
                <p className="text-sm font-medium">{formatActivityType(activity.type)}</p>
                {formatActivityMetadata(activity.metadata) ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {formatActivityMetadata(activity.metadata)}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {[activity.performedBy?.name, formatCustomerDate(activity.createdAt)].filter(Boolean).join(" · ")}
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

const noteSchema = z.object({
  content: z.string().trim().min(1, "Note is required"),
})

function AddCustomerNoteDialog({
  open,
  customerId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  customerId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "" },
  })
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof noteSchema>) => {
      if (!customerId) throw new Error("Customer is required.")

      return customersApi.createNote({
        resourceType: "CUSTOMER",
        resourceId: customerId,
        content: values.content,
        visibility: "TEAM",
      })
    },
    onSuccess,
    onError: (error) => setMessage(getCustomerApiMessage(error, "Unable to add note.")),
  })

  useEffect(() => {
    if (!open) return
    form.reset({ content: "" })
    const timeoutId = window.setTimeout(() => setMessage(null), 0)

    return () => window.clearTimeout(timeoutId)
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a team-visible note to this customer.</DialogDescription>
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

function AddCustomerAttachmentDialog({
  open,
  customerId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  customerId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!customerId || !file) throw new Error("Select a file first.")

      return customersApi.createAttachment({
        resourceType: "CUSTOMER",
        resourceId: customerId,
        file,
        fileName: fileName.trim() || undefined,
      })
    },
    onSuccess,
    onError: (error) => setMessage(getCustomerApiMessage(error, "Unable to upload attachment.")),
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
          <DialogDescription>Upload a file and link it to this customer.</DialogDescription>
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
  attachment: CustomerAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useQuery({
    queryKey: ["customer-attachments", "detail", attachment?.id],
    queryFn: () => customersApi.attachmentDetail(attachment?.id as string),
    enabled: open && Boolean(attachment?.id),
  })
  const detail = detailQuery.data?.data ?? attachment
  const fileUrl = detail ? getAttachmentUrl(detail) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attachment Details</DialogTitle>
          <DialogDescription>Review attachment metadata for this customer.</DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}

        {detailQuery.isError ? (
          <RetryAlert
            message={getCustomerApiMessage(detailQuery.error, "Unable to load attachment details.")}
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
              <MetadataItem label="Created" value={formatCustomerDate(detail.createdAt)} />
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
  attachment: CustomerAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!attachment) throw new Error("Attachment is required.")

      return customersApi.deleteAttachment(attachment.id)
    },
    onSuccess,
    onError: (error) => setMessage(getCustomerApiMessage(error, "Unable to delete attachment.")),
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
            This will remove {attachment?.fileName ? `"${attachment.fileName}"` : "this attachment"} from the
            customer.
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

function AddCustomerContactDialog({
  open,
  customerId,
  existingContactIds,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  customerId: string | null
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
    queryKey: ["contacts", "customer-detail-options", contactSearch],
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
    mutationFn: (input: { contactId?: string; newContact?: CustomerNewContactLinkInput }) => {
      if (!customerId) throw new Error("Customer is required.")
      if (!input.contactId && !input.newContact) throw new Error("Select or add a contact first.")

      return customersApi.addContact(customerId, { ...input, isPrimary })
    },
    onSuccess,
    onError: (error) => setMessage(getCustomerApiMessage(error, "Unable to add contact.")),
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

  const handleCreateContact = (values: CustomerContactFormValues) => {
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
            <DialogDescription>Link an existing contact to this customer.</DialogDescription>
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
                <p className="text-xs text-muted-foreground">
                  This contact will be marked as the customer&apos;s primary contact.
                </p>
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
      <CustomerContactDialog
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

function EditCustomerContactDialog({
  contact,
  open,
  onOpenChange,
  onSuccess,
}: {
  contact: CustomerContact | null
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

function RemoveCustomerContactDialog({
  customerId,
  contact,
  open,
  onOpenChange,
  onSuccess,
}: {
  customerId: string | null
  contact: CustomerContact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!customerId || !contact) throw new Error("Contact is required.")

      return customersApi.removeContact(customerId, contact.id)
    },
    onSuccess,
    onError: (error) => setMessage(getCustomerApiMessage(error, "Unable to remove contact.")),
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
          <DialogTitle>Remove contact from customer?</DialogTitle>
          <DialogDescription>
            {contact ? `"${formatDisplayName(contact.fullName || contact.id)}"` : "This contact"} will be unlinked
            from this customer. The contact profile itself will not be deleted.
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

  return <RetryAlert message={getCustomerApiMessage(error, fallback)} onRetry={onRetry} />
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

function CustomerDetailSkeleton() {
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

const formatActivityMetadata = (metadata?: Record<string, unknown>) => {
  if (!metadata) return ""

  const reason = getMetadataText(metadata, ["reason", "blockReason", "blockedReason", "statusReason"])
  const status = getMetadataText(metadata, ["status", "newStatus", "toStatus"])
  const previousStatus = getMetadataText(metadata, ["previousStatus", "oldStatus", "fromStatus"])

  return [
    previousStatus && status ? `${formatTitleCase(previousStatus)} to ${formatTitleCase(status)}` : null,
    !previousStatus && status ? `Status: ${formatTitleCase(status)}` : null,
    reason ? `Reason: ${reason}` : null,
  ]
    .filter(Boolean)
    .join(" - ")
}

const getMetadataText = (metadata: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
}

const formatFileSize = (value?: number) => {
  if (!value) return ""
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

const getAttachmentUrl = (attachment: CustomerAttachment) => {
  return attachment.downloadUrl ?? attachment.fileUrl ?? attachment.url ?? null
}
