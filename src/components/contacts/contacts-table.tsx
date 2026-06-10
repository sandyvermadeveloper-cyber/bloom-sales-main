"use client"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TablePagination } from "@/components/shared/table-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ContactActionsMenu } from "@/components/contacts/contact-actions-menu"
import { contactPageSizeOptions } from "@/components/contacts/contacts.constants"
import {
  formatContactDate,
  getContactApiMessage,
  getContactName,
} from "@/components/contacts/contacts.utils"
import type { Contact, ContactsPagination } from "@/types/contact"
import { formatDesignation, formatEmail, formatPhoneNumber } from "@/utils/display-format"

type ContactsTableProps = {
  contacts: Contact[]
  pagination?: ContactsPagination
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  limit: (typeof contactPageSizeOptions)[number]
  onRetry: () => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLimitChange: (value: (typeof contactPageSizeOptions)[number]) => void
  onView: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onAddPhone: (contact: Contact) => void
  onAddEmail: (contact: Contact) => void
  onDelete: (contact: Contact) => void
  onRestore: (contact: Contact) => void
}

export function ContactsTable({
  contacts,
  pagination,
  isLoading,
  isFetching,
  isError,
  error,
  limit,
  onRetry,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onLimitChange,
  onView,
  onEdit,
  onAddPhone,
  onAddEmail,
  onDelete,
  onRestore,
}: ContactsTableProps) {
  return (
    <div className="space-y-5">
      {isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getContactApiMessage(error, "Unable to load contacts.")}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Primary Phone</TableHead>
              <TableHead>Primary Email</TableHead>
              <TableHead className="w-32">Updated</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading && contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? contacts.map((contact, index) => (
                  <TableRow
                    key={contact.id}
                    className="group odd:bg-background even:bg-muted/20 hover:bg-primary/5"
                  >
                    <TableCell className="align-middle">
                      <div className="flex justify-center">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/5 text-xs font-semibold text-primary ring-1 ring-primary/10 transition-all group-hover:bg-primary/10 group-hover:ring-primary/20">
                          {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? limit) + index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        {/* <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                          {getContactInitials(contact)}
                        </span> */}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{getContactName(contact)}</p>
                          {/* <p className="truncate text-xs text-muted-foreground">{formatCode(contact.id)}</p> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDesignation(contact.designation)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatPhoneNumber(contact.primaryPhone)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatEmail(contact.primaryEmail)}</span>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="secondary">{contact.relatedLeads?.length ?? 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {Array.isArray(contact.relatedCustomers) ? contact.relatedCustomers.length : 0}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatContactDate(contact.updatedAt || contact.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <ContactActionsMenu
                        contact={contact}
                        onView={onView}
                        onEdit={onEdit}
                        onAddPhone={onAddPhone}
                        onAddEmail={onAddEmail}
                        onDelete={onDelete}
                        onRestore={onRestore}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        limit={limit}
        pageSizeOptions={contactPageSizeOptions}
        isFetching={isFetching}
        onLimitChange={(value) => onLimitChange(value as (typeof contactPageSizeOptions)[number])}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  )
}
