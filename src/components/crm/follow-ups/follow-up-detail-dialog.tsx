"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Eye,
  Loader2,
  Lock,
  MoreHorizontal,
  NotebookText,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { followUpsApi } from "@/api/follow-ups.api"
import {
  followUpOutcomeBadgeClasses,
  followUpStatusBadgeClasses,
  followUpTypeBadgeClasses,
} from "@/components/crm/follow-ups/follow-ups.constants"
import {
  formatFollowUpDate,
  formatFollowUpDateTime,
  getFollowUpApiMessage,
  getFollowUpAssigneeName,
  getFollowUpContactName,
  getFollowUpCreatedByName,
  getFollowUpLeadLabel,
  getFollowUpOutcomeLabel,
  getFollowUpStatusLabel,
  getFollowUpTypeLabel,
} from "@/components/crm/follow-ups/follow-ups.utils"
import {
  leadPriorityBadgeClasses,
  leadQualificationBadgeClasses,
  leadStatusBadgeClasses,
} from "@/components/crm/leads/leads.constants"
import {
  getLeadPriorityLabel,
  getLeadQualificationLabel,
  getLeadStatusLabel,
} from "@/components/crm/leads/leads.utils"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { FollowUp, FollowUpAttachment, FollowUpNote } from "@/types/follow-up"
import {
  formatCode,
  formatDescription,
  formatDisplayName,
  formatPhoneNumber,
  formatTitleCase,
} from "@/utils/display-format"

type FollowUpDetailDialogProps = {
  open: boolean
  followUp: FollowUp | null
  onOpenChange: (open: boolean) => void
}

export function FollowUpDetailDialog({ open, followUp, onOpenChange }: FollowUpDetailDialogProps) {
  const queryClient = useQueryClient()
  const followUpId = followUp?.id ?? null
  const [noteOpen, setNoteOpen] = useState(false)
  const [editNote, setEditNote] = useState<FollowUpNote | null>(null)
  const [deleteNote, setDeleteNote] = useState<FollowUpNote | null>(null)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [viewAttachment, setViewAttachment] = useState<FollowUpAttachment | null>(null)
  const [deleteAttachment, setDeleteAttachment] = useState<FollowUpAttachment | null>(null)

  const detailQuery = useQuery({
    queryKey: ["follow-ups", "detail", followUpId],
    queryFn: () => followUpsApi.detail(followUpId as string),
    enabled: open && Boolean(followUpId),
  })
  const notesQuery = useQuery({
    queryKey: ["follow-ups", "detail", followUpId, "notes"],
    queryFn: () => followUpsApi.notes(followUpId as string),
    enabled: open && Boolean(followUpId),
  })
  const attachmentsQuery = useQuery({
    queryKey: ["follow-ups", "detail", followUpId, "attachments"],
    queryFn: () => followUpsApi.attachments(followUpId as string),
    enabled: open && Boolean(followUpId),
  })
  const detail = detailQuery.data?.data ?? followUp
  const notes = notesQuery.data?.data ?? []
  const attachments = attachmentsQuery.data?.data ?? []

  const refetchNotes = () => {
    void queryClient.invalidateQueries({ queryKey: ["follow-ups", "detail", followUpId, "notes"] })
  }
  const refetchAttachments = () => {
    void queryClient.invalidateQueries({ queryKey: ["follow-ups", "detail", followUpId, "attachments"] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Follow-Up Details
            {detail?.followUpNumber ? (
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                {formatCode(detail.followUpNumber)}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {detail ? getFollowUpLeadLabel(detail) : "Follow-up information"}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading && !detail ? <FollowUpDetailSkeleton /> : null}

        {detailQuery.isError ? (
          <RetryAlert
            message={getFollowUpApiMessage(detailQuery.error, "Unable to load follow-up details.")}
            onRetry={() => detailQuery.refetch()}
          />
        ) : null}

        {detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {detailQuery.isLoading ? <Skeleton className="h-6 w-24" /> : null}
              <LabeledBadge label="Type" className={followUpTypeBadgeClasses[detail.type]}>
                {getFollowUpTypeLabel(detail.type, detail.customType)}
              </LabeledBadge>
              <LabeledBadge label="Status" className={followUpStatusBadgeClasses[detail.status]}>
                {getFollowUpStatusLabel(detail.status)}
              </LabeledBadge>
              {detail.outcome ? (
                <LabeledBadge label="Outcome" className={followUpOutcomeBadgeClasses[detail.outcome]}>
                  {getFollowUpOutcomeLabel(detail.outcome)}
                </LabeledBadge>
              ) : null}
              {detail.isOverdue ? (
                <LabeledBadge label="Due" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  Overdue
                </LabeledBadge>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Scheduled At" value={formatFollowUpDateTime(detail.scheduledAt)} />
              <DetailRow label="Assigned To" value={getFollowUpAssigneeName(detail)} />
              <DetailRow label="Created By" value={getFollowUpCreatedByName(detail)} />
              {detail.completedAt ? (
                <DetailRow label="Completed At" value={formatFollowUpDateTime(detail.completedAt)} />
              ) : null}
              {detail.completedBy?.name ? (
                <DetailRow label="Completed By" value={formatDisplayName(detail.completedBy.name)} />
              ) : null}
            </div>

            {detail.lead ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Lead</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">{getFollowUpLeadLabel(detail)}</p>
                    {detail.lead.leadNumber ? (
                      <p className="font-mono text-xs text-muted-foreground">{formatCode(detail.lead.leadNumber)}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {detail.lead.status ? (
                      <LabeledBadge label="Lead Status" className={leadStatusBadgeClasses[detail.lead.status] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadStatusLabel(detail.lead.status)}
                      </LabeledBadge>
                    ) : null}
                    {detail.lead.priority ? (
                      <LabeledBadge label="Priority" className={leadPriorityBadgeClasses[detail.lead.priority] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadPriorityLabel(detail.lead.priority)}
                      </LabeledBadge>
                    ) : null}
                    {detail.lead.qualification ? (
                      <LabeledBadge label="Qualification" className={leadQualificationBadgeClasses[detail.lead.qualification] ?? "border-border bg-muted text-muted-foreground"}>
                        {getLeadQualificationLabel(detail.lead.qualification)}
                      </LabeledBadge>
                    ) : null}
                  </div>
                  {detail.lead.expectedClosingDate ? (
                    <DetailRow label="Expected Closing" value={formatFollowUpDate(detail.lead.expectedClosingDate)} />
                  ) : null}
                </div>
              </div>
            ) : null}

            {detail.primaryContact || detail.companyName ? (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Contact</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detail.companyName ? <DetailRow label="Company" value={detail.companyName} /> : null}
                  {detail.primaryContact?.fullName ? (
                    <DetailRow label="Contact" value={getFollowUpContactName(detail)} />
                  ) : null}
                  {detail.primaryContact?.designation ? (
                    <DetailRow label="Designation" value={detail.primaryContact.designation} />
                  ) : null}
                  {detail.primaryContact?.primaryPhone ? (
                    <DetailRow label="Phone" value={formatPhoneNumber(detail.primaryContact.primaryPhone)} />
                  ) : null}
                  {detail.primaryContact?.primaryEmail ? (
                    <DetailRow label="Email" value={detail.primaryContact.primaryEmail} />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">Follow-Up Notes</h3>
              <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {detail.notes || "No follow-up notes added."}
              </p>
            </div>

            <FollowUpNotesCard
              notes={notes}
              isLoading={notesQuery.isLoading}
              isError={notesQuery.isError}
              error={notesQuery.error}
              onRetry={() => notesQuery.refetch()}
              onAdd={() => setNoteOpen(true)}
              onEdit={setEditNote}
              onDelete={setDeleteNote}
            />

            <FollowUpAttachmentsCard
              attachments={attachments}
              isLoading={attachmentsQuery.isLoading}
              isError={attachmentsQuery.isError}
              error={attachmentsQuery.error}
              onRetry={() => attachmentsQuery.refetch()}
              onAdd={() => setAttachmentOpen(true)}
              onView={setViewAttachment}
              onDelete={setDeleteAttachment}
            />
          </div>
        ) : null}

        <AddFollowUpNoteDialog
          open={noteOpen}
          followUpId={followUpId}
          onOpenChange={setNoteOpen}
          onSuccess={() => {
            setNoteOpen(false)
            refetchNotes()
          }}
        />
        <EditFollowUpNoteDialog
          note={editNote}
          open={Boolean(editNote)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditNote(null)
          }}
          onSuccess={() => {
            setEditNote(null)
            refetchNotes()
          }}
        />
        <DeleteFollowUpNoteDialog
          note={deleteNote}
          open={Boolean(deleteNote)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteNote(null)
          }}
          onSuccess={() => {
            setDeleteNote(null)
            refetchNotes()
          }}
        />
        <AddFollowUpAttachmentDialog
          open={attachmentOpen}
          followUpId={followUpId}
          onOpenChange={setAttachmentOpen}
          onSuccess={() => {
            setAttachmentOpen(false)
            refetchAttachments()
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
            refetchAttachments()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function FollowUpNotesCard({
  notes,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
}: {
  notes: FollowUpNote[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onEdit: (note: FollowUpNote) => void
  onDelete: (note: FollowUpNote) => void
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
                <p className="whitespace-pre-wrap break-words text-sm font-medium">{formatDescription(note.content)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{[note.createdBy?.name ? formatDisplayName(note.createdBy.name) : "", formatFollowUpDate(note.createdAt)].filter(Boolean).join(" · ")}</span>
                  {note.visibility ? (
                    <Badge variant="outline" className="h-5 gap-1 rounded-full px-2 text-[10px] font-medium">
                      {note.visibility === "PRIVATE" ? <Lock className="size-3" /> : <Users className="size-3" />}
                      {formatTitleCase(note.visibility)}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label="Open note actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(note)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(note)}>
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

function FollowUpAttachmentsCard({
  attachments,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onView,
  onDelete,
}: {
  attachments: FollowUpAttachment[]
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  onAdd: () => void
  onView: (attachment: FollowUpAttachment) => void
  onDelete: (attachment: FollowUpAttachment) => void
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
                    {[formatFileSize(attachment.fileSize), attachment.mimeType, formatFollowUpDate(attachment.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Open attachment actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onView(attachment)}>
                    <Eye className="size-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(attachment)}>
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

const noteSchema = z.object({
  content: z.string().trim().min(1, "Note is required"),
  visibility: z.enum(["TEAM", "PRIVATE"]),
})

const noteVisibilityOptions: Array<{ value: "TEAM" | "PRIVATE"; label: string; icon: typeof Users }> = [
  { value: "TEAM", label: "Team", icon: Users },
  { value: "PRIVATE", label: "Private", icon: Lock },
]

function AddFollowUpNoteDialog({
  open,
  followUpId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  followUpId: string | null
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
      if (!followUpId) throw new Error("Follow-up is required.")

      return followUpsApi.createNote({
        resourceType: "FOLLOW_UP",
        resourceId: followUpId,
        content: values.content,
        visibility: values.visibility,
      })
    },
    onSuccess: () => {
      form.reset({ content: "", visibility: "TEAM" })
      setMessage(null)
      onSuccess()
    },
    onError: (error) => setMessage(getFollowUpApiMessage(error, "Unable to add note.")),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset({ content: "", visibility: "TEAM" })
          setMessage(null)
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a note to this follow-up.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            <NoteFields isPending={mutation.isPending} />
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

function EditFollowUpNoteDialog({
  note,
  open,
  onOpenChange,
  onSuccess,
}: {
  note: FollowUpNote | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    values: {
      content: note?.content ?? "",
      visibility: note?.visibility === "PRIVATE" ? "PRIVATE" : "TEAM",
    },
  })
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof noteSchema>) => {
      if (!note) throw new Error("Note is required.")

      return followUpsApi.updateNote(note.id, values)
    },
    onSuccess: () => {
      setMessage(null)
      onSuccess()
    },
    onError: (error) => setMessage(getFollowUpApiMessage(error, "Unable to update note.")),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setMessage(null)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Update this follow-up note.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            <NoteFields isPending={mutation.isPending} />
            <DialogFooter>
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function NoteFields({ isPending }: { isPending: boolean }) {
  return (
    <>
      <FormField
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl className="mt-2">
              <Textarea rows={5} placeholder="Write note..." disabled={isPending} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visibility</FormLabel>
            <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
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
    </>
  )
}

function DeleteFollowUpNoteDialog({
  note,
  open,
  onOpenChange,
  onSuccess,
}: {
  note: FollowUpNote | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!note) throw new Error("Note is required.")

      return followUpsApi.deleteNote(note.id)
    },
    onSuccess: () => {
      setMessage(null)
      onSuccess()
    },
    onError: (error) => setMessage(getFollowUpApiMessage(error, "Unable to delete note.")),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setMessage(null)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete note?</DialogTitle>
          <DialogDescription>This will remove this note from the follow-up.</DialogDescription>
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

function AddFollowUpAttachmentDialog({
  open,
  followUpId,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  followUpId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!followUpId || !file) throw new Error("Select a file first.")

      return followUpsApi.createAttachment({
        resourceType: "FOLLOW_UP",
        resourceId: followUpId,
        file,
        fileName: fileName.trim() || undefined,
      })
    },
    onSuccess: () => {
      setFile(null)
      setFileName("")
      setMessage(null)
      onSuccess()
    },
    onError: (error) => setMessage(getFollowUpApiMessage(error, "Unable to upload attachment.")),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setFile(null)
          setFileName("")
          setMessage(null)
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
          <DialogDescription>Upload a file and link it to this follow-up.</DialogDescription>
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
  attachment: FollowUpAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detailQuery = useQuery({
    queryKey: ["attachments", "detail", attachment?.id],
    queryFn: () => followUpsApi.attachmentDetail(attachment?.id as string),
    enabled: open && Boolean(attachment?.id),
  })
  const detail = detailQuery.data?.data ?? attachment
  const fileUrl = detail ? getAttachmentUrl(detail) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attachment Details</DialogTitle>
          <DialogDescription>Review attachment metadata for this follow-up.</DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? <Skeleton className="h-32 w-full" /> : null}

        {detailQuery.isError ? (
          <RetryAlert
            message={getFollowUpApiMessage(detailQuery.error, "Unable to load attachment details.")}
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
              <DetailRow label="Uploaded By" value={formatDisplayName(detail.uploadedBy?.name || "-")} />
              <DetailRow label="Created" value={formatFollowUpDate(detail.createdAt)} />
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
  attachment: FollowUpAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () => {
      if (!attachment) throw new Error("Attachment is required.")

      return followUpsApi.deleteAttachment(attachment.id)
    },
    onSuccess: () => {
      setMessage(null)
      onSuccess()
    },
    onError: (error) => setMessage(getFollowUpApiMessage(error, "Unable to delete attachment.")),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setMessage(null)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete attachment?</DialogTitle>
          <DialogDescription>
            This will remove {attachment?.fileName ? `"${attachment.fileName}"` : "this attachment"} from the follow-up.
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

function DetailSection({
  title,
  actionLabel,
  onAdd,
  children,
}: {
  title: string
  actionLabel?: string
  onAdd?: () => void
  children: ReactNode
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
  if (isLoading) return <Skeleton className="h-24 w-full rounded-lg" />
  if (!isError) return null

  return <RetryAlert message={getFollowUpApiMessage(error, fallback)} onRetry={onRetry} />
}

function RetryAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </Alert>
  )
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">{children}</p>
}

function FollowUpDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  )
}

function LabeledBadge({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge
        variant="outline"
        className={cn("whitespace-nowrap px-2.5 py-0.5 font-normal", className ?? "border-border bg-muted text-muted-foreground")}
      >
        {children}
      </Badge>
    </div>
  )
}

const formatFileSize = (value?: number) => {
  if (!value) return ""
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

const getAttachmentUrl = (attachment: FollowUpAttachment) => {
  return attachment.downloadUrl || attachment.fileUrl || attachment.url || null
}
