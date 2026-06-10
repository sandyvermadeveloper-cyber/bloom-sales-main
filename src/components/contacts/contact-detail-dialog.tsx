"use client"

import { useQuery } from "@tanstack/react-query"
import {
  BriefcaseBusiness,
  CalendarClock,
  Link2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
} from "lucide-react"
import type React from "react"

import { contactsApi } from "@/api/contacts.api"
import { ContactLabelBadge } from "@/components/shared/contact-label-badge"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatContactDate,
  getContactApiMessage,
  getContactInitials,
  getContactName,
} from "@/components/contacts/contacts.utils"
import type { Contact, ContactEmail, ContactPhone } from "@/types/contact"
import {
  formatCode,
  formatDesignation,
  formatDisplayName,
  formatEmail,
  formatPhoneNumber,
  formatTitleCase,
} from "@/utils/display-format"

type ContactDetailDialogProps = {
  open: boolean
  contact: Contact | null
  onOpenChange: (open: boolean) => void
  onEdit: (contact: Contact) => void
  onAddPhone: (contact: Contact) => void
  onAddEmail: (contact: Contact) => void
  onDeletePhone: (contact: Contact, phone: ContactPhone) => void
  onDeleteEmail: (contact: Contact, email: ContactEmail) => void
}

export function ContactDetailDialog({
  open,
  contact,
  onOpenChange,
  onEdit,
  onAddPhone,
  onAddEmail,
  onDeletePhone,
  onDeleteEmail,
}: ContactDetailDialogProps) {
  const contactId = contact?.id
  const detailQuery = useQuery({
    queryKey: ["contacts", "detail", contactId],
    queryFn: () => contactsApi.detail(contactId ?? ""),
    enabled: open && Boolean(contactId),
  })

  const detail = detailQuery.data?.data ?? contact
  const phones = detail?.phones ?? []
  const emails = detail?.emails ?? []
  const primaryPhone = detail?.primaryPhone || phones.find((phone) => phone.isPrimary)?.phone || phones[0]?.phone
  const primaryEmail = detail?.primaryEmail || emails.find((email) => email.isPrimary)?.email || emails[0]?.email

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5">
          <DialogTitle className="text-xl">Contact details</DialogTitle>
          <DialogDescription>View contact profile, communication channels, and linked records.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          {detailQuery.isError ? (
            <Alert variant="destructive">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{getContactApiMessage(detailQuery.error, "Unable to load contact details.")}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => detailQuery.refetch()}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            </Alert>
          ) : null}

          {detailQuery.isLoading ? (
            <div className="space-y-4 pt-1">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="border-b bg-primary/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm">
                        {getContactInitials(detail)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-semibold tracking-tight">{getContactName(detail)}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="gap-1.5">
                            <BriefcaseBusiness className="size-3" />
                            {formatDesignation(detail.designation)}
                          </Badge>
                          {detail.deletedAt ? <Badge variant="destructive">Deleted</Badge> : null}
                        </div>
                      </div>
                    </div>
                    <Button type="button" onClick={() => onEdit(detail)}>
                      <Pencil className="size-4" />
                      Edit profile
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <SummaryMetric icon={Phone} label="Primary Phone" value={formatPhoneNumber(primaryPhone)} />
                  <SummaryMetric icon={Mail} label="Primary Email" value={formatEmail(primaryEmail)} />
                  <SummaryMetric
                    icon={CalendarClock}
                    label="Last Updated"
                    value={formatContactDate(detail.updatedAt || detail.createdAt)}
                  />
                  <SummaryMetric
                    icon={Link2}
                    label="Linked Records"
                    value={`${detail.relatedLeads?.length ?? 0} leads / ${
                      Array.isArray(detail.relatedCustomers) ? detail.relatedCustomers.length : 0
                    } customers`}
                  />
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <DetailSection
                  title="Phones"
                  count={phones.length}
                  actionLabel="Add phone"
                  onAction={() => onAddPhone(detail)}
                >
                  {phones.length ? (
                    <div className="space-y-2">
                      {phones.map((phone) => (
                        <ContactMethodRow
                          key={phone.id ?? phone.phone}
                          icon={Phone}
                          value={formatPhoneNumber(phone.phone)}
                          label={phone.label}
                          isPrimary={phone.isPrimary}
                          onDelete={phone.id ? () => onDeletePhone(detail, phone) : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyText>No phones added.</EmptyText>
                  )}
                </DetailSection>

                <DetailSection
                  title="Emails"
                  count={emails.length}
                  actionLabel="Add email"
                  onAction={() => onAddEmail(detail)}
                >
                  {emails.length ? (
                    <div className="space-y-2">
                      {emails.map((email) => (
                        <ContactMethodRow
                          key={email.id ?? email.email}
                          icon={Mail}
                          value={formatEmail(email.email)}
                          label={email.label}
                          isPrimary={email.isPrimary}
                          onDelete={email.id ? () => onDeleteEmail(detail, email) : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyText>No emails added.</EmptyText>
                  )}
                </DetailSection>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <DetailSection title="Related leads" count={detail.relatedLeads?.length ?? 0}>
                  {detail.relatedLeads?.length ? (
                    <div className="space-y-2">
                      {detail.relatedLeads.map((lead) => (
                        <div key={lead.id} className="rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {formatTitleCase(lead.title || lead.leadNumber || lead.id)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">{formatCode(lead.leadNumber || lead.id)}</p>
                            </div>
                            {lead.status ? <Badge variant="outline">{lead.status}</Badge> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyText>No related leads.</EmptyText>
                  )}
                </DetailSection>

                <DetailSection
                  title="Related customers"
                  count={Array.isArray(detail.relatedCustomers) ? detail.relatedCustomers.length : 0}
                >
                  {Array.isArray(detail.relatedCustomers) && detail.relatedCustomers.length ? (
                    <div className="space-y-2">
                      {detail.relatedCustomers.map((customer, index) => (
                        <div
                          key={String((customer as { id?: string }).id ?? index)}
                          className="rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40"
                        >
                          <p className="truncate text-sm font-medium">
                              {formatDisplayName(
                                (customer as { name?: string; customerNumber?: string; id?: string }).name ||
                                  (customer as { customerNumber?: string }).customerNumber ||
                                  (customer as { id?: string }).id ||
                                  "Customer"
                              )}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCode(
                              (customer as { customerNumber?: string }).customerNumber ||
                                (customer as { id?: string }).id ||
                                "-"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyText>No related customers.</EmptyText>
                  )}
                </DetailSection>
              </div>
            </div>
          ) : (
            <EmptyText>No contact selected.</EmptyText>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type DetailSectionProps = {
  title: string
  count?: number
  actionLabel?: string
  onAction?: () => void
  children: React.ReactNode
}

function DetailSection({ title, count, actionLabel, onAction, children }: DetailSectionProps) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{title}</h4>
          {typeof count === "number" ? <Badge variant="secondary">{count}</Badge> : null}
        </div>
        {actionLabel && onAction ? (
          <Button type="button" variant="ghost" size="sm" onClick={onAction}>
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  )
}

type SummaryMetricProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function SummaryMetric({ icon: Icon, label, value }: SummaryMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-background p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}

type ContactMethodRowProps = {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  isPrimary?: boolean
  onDelete?: () => void
}

function ContactMethodRow({ icon: Icon, value, label, isPrimary, onDelete }: ContactMethodRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{value}</p>
          <div className="mt-1 flex items-center gap-2">
            <ContactLabelBadge label={label} />
            {isPrimary ? <Badge variant="outline">Primary</Badge> : null}
          </div>
        </div>
      </div>
      {onDelete ? (
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${value}`} onClick={onDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  )
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
      <UserRound className="size-4" />
      {children}
    </div>
  )
}
