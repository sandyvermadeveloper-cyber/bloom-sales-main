"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

import { contactsApi } from "@/api/contacts.api"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ContactConfirmDialog,
  type ContactConfirmTarget,
} from "@/components/contacts/contact-confirm-dialog"
import { ContactDetailDialog } from "@/components/contacts/contact-detail-dialog"
import { ContactEmailDialog } from "@/components/contacts/contact-email-dialog"
import { ContactPhoneDialog } from "@/components/contacts/contact-phone-dialog"
import { ContactProfileDialog } from "@/components/contacts/contact-profile-dialog"
import { ContactsFilters } from "@/components/contacts/contacts-filters"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { contactPageSizeOptions, defaultContactPageSize } from "@/components/contacts/contacts.constants"
import {
  getContactApiMessage,
  normalizeContactSearch,
  parseContactLimit,
  parseContactPage,
} from "@/components/contacts/contacts.utils"
import type {
  Contact,
  ContactEmail,
  ContactPhone,
  ListContactsQuery,
} from "@/types/contact"
import type {
  ContactEmailFormValues,
  ContactPhoneFormValues,
  ContactProfileFormValues,
} from "@/schemas/contact.schemas"

function ContactsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(() => parseContactPage(searchParams.get("page")))
  const [limit, setLimit] = useState<(typeof contactPageSizeOptions)[number]>(() =>
    parseContactLimit(searchParams.get("limit"), contactPageSizeOptions, defaultContactPageSize)
  )
  const [searchDraft, setSearchDraft] = useState(() => normalizeContactSearch(searchParams.get("search")))
  const [search, setSearch] = useState(() => normalizeContactSearch(searchParams.get("search")))
  const [viewContact, setViewContact] = useState<Contact | null>(null)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [phoneContact, setPhoneContact] = useState<Contact | null>(null)
  const [emailContact, setEmailContact] = useState<Contact | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<ContactConfirmTarget | null>(null)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = normalizeContactSearch(searchDraft)
      if (search === nextSearch) return

      setPage(1)
      setSearch(nextSearch)
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [search, searchDraft])

  useEffect(() => {
    const params = new URLSearchParams()

    if (page > 1) params.set("page", String(page))
    if (limit !== defaultContactPageSize) params.set("limit", String(limit))
    if (search) params.set("search", search)

    const nextSearchParams = params.toString()
    if (nextSearchParams === searchParamsString) return

    router.replace(nextSearchParams ? `${pathname}?${nextSearchParams}` : pathname, {
      scroll: false,
    })
  }, [limit, page, pathname, router, search, searchParamsString])

  const query: ListContactsQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [limit, page, search]
  )

  const contactsQuery = useQuery({
    queryKey: ["contacts", query],
    queryFn: () => contactsApi.list(query),
    placeholderData: keepPreviousData,
  })

  const contacts = contactsQuery.data?.data.contacts ?? []
  const pagination = contactsQuery.data?.data.pagination

  const invalidateContacts = (contactId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ["contacts"] })
    if (contactId) {
      void queryClient.invalidateQueries({ queryKey: ["contacts", "detail", contactId] })
    }
  }

  const updateMutation = useMutation({
    mutationFn: (values: ContactProfileFormValues) => {
      if (!editContact) throw new Error("Contact is required to update.")

      return contactsApi.update(editContact.id, {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        designation: values.designation || undefined,
      })
    },
    onSuccess: (response) => {
      const contactId = editContact?.id
      setEditContact(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateContacts(contactId)
    },
    onError: (error) => {
      setDialogMessage(getContactApiMessage(error, "Unable to update contact. Please try again."))
    },
  })

  const addPhoneMutation = useMutation({
    mutationFn: (values: ContactPhoneFormValues) => {
      if (!phoneContact) throw new Error("Contact is required to add phone.")

      return contactsApi.addPhone(phoneContact.id, values)
    },
    onSuccess: (response) => {
      const contactId = phoneContact?.id
      setPhoneContact(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateContacts(contactId)
    },
    onError: (error) => {
      setDialogMessage(getContactApiMessage(error, "Unable to add phone. Please try again."))
    },
  })

  const addEmailMutation = useMutation({
    mutationFn: (values: ContactEmailFormValues) => {
      if (!emailContact) throw new Error("Contact is required to add email.")

      return contactsApi.addEmail(emailContact.id, values)
    },
    onSuccess: (response) => {
      const contactId = emailContact?.id
      setEmailContact(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateContacts(contactId)
    },
    onError: (error) => {
      setDialogMessage(getContactApiMessage(error, "Unable to add email. Please try again."))
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => {
      if (!confirmTarget) throw new Error("A confirmation target is required.")

      if (confirmTarget.type === "phone") {
        if (!confirmTarget.phone.id) throw new Error("Phone id is required.")
        return contactsApi.deletePhone(confirmTarget.contact.id, confirmTarget.phone.id)
      }

      if (confirmTarget.type === "email") {
        if (!confirmTarget.email.id) throw new Error("Email id is required.")
        return contactsApi.deleteEmail(confirmTarget.contact.id, confirmTarget.email.id)
      }

      return confirmTarget.mode === "delete"
        ? contactsApi.delete(confirmTarget.contact.id)
        : contactsApi.restore(confirmTarget.contact.id)
    },
    onSuccess: (response) => {
      const contactId = confirmTarget?.contact.id
      setConfirmTarget(null)
      setDialogMessage(null)
      setPageMessage(response.message)
      invalidateContacts(contactId)
    },
    onError: (error) => {
      setDialogMessage(getContactApiMessage(error, "Unable to complete action. Please try again."))
    },
  })

  const resetFilters = () => {
    setPage(1)
    setLimit(defaultContactPageSize)
    setSearch("")
    setSearchDraft("")
  }

  const resetDialogState = () => {
    setDialogMessage(null)
    setPageMessage(null)
  }

  const openViewDialog = (contact: Contact) => {
    resetDialogState()
    setViewContact(contact)
  }

  const openEditDialog = (contact: Contact) => {
    updateMutation.reset()
    resetDialogState()
    setEditContact(contact)
  }

  const openPhoneDialog = (contact: Contact) => {
    addPhoneMutation.reset()
    resetDialogState()
    setPhoneContact(contact)
  }

  const openEmailDialog = (contact: Contact) => {
    addEmailMutation.reset()
    resetDialogState()
    setEmailContact(contact)
  }

  const openDeleteDialog = (contact: Contact) => {
    confirmMutation.reset()
    resetDialogState()
    setConfirmTarget({ type: "contact", mode: "delete", contact })
  }

  const openRestoreDialog = (contact: Contact) => {
    confirmMutation.reset()
    resetDialogState()
    setConfirmTarget({ type: "contact", mode: "restore", contact })
  }

  const openDeletePhoneDialog = (contact: Contact, phone: ContactPhone) => {
    confirmMutation.reset()
    resetDialogState()
    setConfirmTarget({ type: "phone", contact, phone })
  }

  const openDeleteEmailDialog = (contact: Contact, email: ContactEmail) => {
    confirmMutation.reset()
    resetDialogState()
    setConfirmTarget({ type: "email", contact, email })
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contacts</h1>
        <p className="text-sm text-muted-foreground">
          Manage CRM contacts, phones, emails, and linked records.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Contacts</CardTitle>
          {pagination ? (
            <p className="text-sm text-muted-foreground">
              {`${pagination.totalItems} contacts - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {pageMessage ? (
            <Alert variant="success">
              <p>{pageMessage}</p>
            </Alert>
          ) : null}

          <ContactsFilters
            searchDraft={searchDraft}
            onSearchDraftChange={setSearchDraft}
            onReset={resetFilters}
          />

          <ContactsTable
            contacts={contacts}
            pagination={pagination}
            isLoading={contactsQuery.isLoading}
            isFetching={contactsQuery.isFetching}
            isError={contactsQuery.isError}
            error={contactsQuery.error}
            limit={limit}
            onRetry={() => contactsQuery.refetch()}
            onPageChange={setPage}
            onPreviousPage={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            onNextPage={() => setPage((currentPage) => currentPage + 1)}
            onLimitChange={(nextLimit) => {
              setPage(1)
              setLimit(nextLimit)
            }}
            onView={openViewDialog}
            onEdit={openEditDialog}
            onAddPhone={openPhoneDialog}
            onAddEmail={openEmailDialog}
            onDelete={openDeleteDialog}
            onRestore={openRestoreDialog}
          />
        </CardContent>
      </Card>

      <ContactDetailDialog
        open={Boolean(viewContact)}
        contact={viewContact}
        onOpenChange={(open) => {
          if (!open) setViewContact(null)
        }}
        onEdit={openEditDialog}
        onAddPhone={openPhoneDialog}
        onAddEmail={openEmailDialog}
        onDeletePhone={openDeletePhoneDialog}
        onDeleteEmail={openDeleteEmailDialog}
      />

      <ContactProfileDialog
        open={Boolean(editContact)}
        contact={editContact}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        message={dialogMessage}
        onOpenChange={(open) => {
          if (open || updateMutation.isPending) return
          setEditContact(null)
          setDialogMessage(null)
        }}
        onSubmit={(values) => {
          setDialogMessage(null)
          updateMutation.mutate(values)
        }}
      />

      <ContactPhoneDialog
        open={Boolean(phoneContact)}
        isPending={addPhoneMutation.isPending}
        error={addPhoneMutation.error}
        message={dialogMessage}
        onOpenChange={(open) => {
          if (open || addPhoneMutation.isPending) return
          setPhoneContact(null)
          setDialogMessage(null)
        }}
        onSubmit={(values) => {
          setDialogMessage(null)
          addPhoneMutation.mutate(values)
        }}
      />

      <ContactEmailDialog
        open={Boolean(emailContact)}
        isPending={addEmailMutation.isPending}
        error={addEmailMutation.error}
        message={dialogMessage}
        onOpenChange={(open) => {
          if (open || addEmailMutation.isPending) return
          setEmailContact(null)
          setDialogMessage(null)
        }}
        onSubmit={(values) => {
          setDialogMessage(null)
          addEmailMutation.mutate(values)
        }}
      />

      <ContactConfirmDialog
        target={confirmTarget}
        isPending={confirmMutation.isPending}
        message={dialogMessage}
        onOpenChange={(open) => {
          if (open || confirmMutation.isPending) return
          setConfirmTarget(null)
          setDialogMessage(null)
        }}
        onConfirm={() => {
          setDialogMessage(null)
          confirmMutation.mutate()
        }}
      />
    </section>
  )
}

export function ContactsPageClient() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ContactsPageContent />
    </Suspense>
  )
}
