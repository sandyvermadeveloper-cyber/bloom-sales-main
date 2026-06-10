"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  BriefcaseBusiness,
  Calendar,
  Info,
  Loader2,
  Plus,
  Search,
  Target,
  Users,
  WalletCards,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { useForm, useWatch } from "react-hook-form"

import { contactsApi } from "@/api/contacts.api"
import { LeadContactDialog } from "@/components/leads/lead-contact-dialog"
import {
  leadFields,
  leadPriorities,
  leadPriorityLabels,
  leadQualifications,
  leadQualificationLabels,
} from "@/components/leads/leads.constants"
import { SearchableMultiSelect, SearchableSelect } from "@/components/leads/lead-searchable-select"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { leadContactSchema, leadSchema, type LeadFormValues } from "@/schemas/lead.schemas"
import type { Contact } from "@/types/contact"
import { formatDisplayName, formatEmail, formatPhoneNumber } from "@/utils/display-format"
import type { LeadSource } from "@/types/lead-source"
import type { Service } from "@/types/service"
import { applyApiFieldErrors } from "@/utils/form-errors"

const defaultLeadValues: LeadFormValues = {
  title: "",
  sourceId: "",
  serviceIds: [],
  summary: "",
  budgetMin: "",
  budgetMax: "",
  priority: "HIGH",
  qualification: "WARM",
  expectedClosingDate: "",
  existingContactIds: [],
  newContacts: [],
}

type LeadDialogProps = {
  open: boolean
  isPending: boolean
  error: unknown
  message: string | null
  optionsMessage: string | null
  sources: LeadSource[]
  services: Service[]
  isLoadingOptions: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: LeadFormValues) => void
}

export function LeadDialog({
  open,
  isPending,
  error,
  message,
  optionsMessage,
  sources,
  services,
  isLoadingOptions,
  onOpenChange,
  onSubmit,
}: LeadDialogProps) {
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactSearchDraft, setContactSearchDraft] = useState("")
  const [contactSearch, setContactSearch] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: defaultLeadValues,
  })
  const sourceOptions = useMemo(
    () =>
      sources.map((source) => ({
        value: source.id,
        label: source.label || source.name || source.id,
      })),
    [sources]
  )
  const serviceOptions = useMemo(
    () =>
      services.map((service) => ({
        value: service.id,
        label: service.label || service.name || service.id,
      })),
    [services]
  )
  const existingContactIds = useWatch({ control: form.control, name: "existingContactIds" })
  const newContacts = useWatch({ control: form.control, name: "newContacts" })

  useEffect(() => {
    if (!open) return
    form.clearErrors()
    form.reset(defaultLeadValues)
    const timeoutId = window.setTimeout(() => {
      setSelectedContacts([])
      setContactSearchDraft("")
      setContactSearch("")
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [form, open])

  useEffect(() => {
    applyApiFieldErrors(error, form, leadFields)
  }, [error, form])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setContactSearch(contactSearchDraft.trim())
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [contactSearchDraft])

  const contactsQuery = useQuery({
    queryKey: ["contacts", "lead-search", contactSearch],
    queryFn: () => contactsApi.list({ page: 1, limit: 20, search: contactSearch }),
    enabled: open && contactSearch.length >= 2,
    staleTime: 60 * 1000,
  })

  const contacts = contactsQuery.data?.data.contacts ?? []

  const toggleExistingContact = (contact: Contact) => {
    const selected = existingContactIds.includes(contact.id)
    const nextIds = selected
      ? existingContactIds.filter((contactId) => contactId !== contact.id)
      : [...existingContactIds, contact.id]

    form.setValue("existingContactIds", nextIds, { shouldDirty: true, shouldValidate: true })
    setSelectedContacts((currentContacts) =>
      selected
        ? currentContacts.filter((currentContact) => currentContact.id !== contact.id)
        : [...currentContacts, contact]
    )
  }

  const removeNewContact = (index: number) => {
    form.setValue(
      "newContacts",
      newContacts.filter((_, contactIndex) => contactIndex !== index),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-4 left-auto right-4 top-4 max-h-[calc(100vh-2rem)] w-[min(520px,calc(100%-2rem))] max-w-none translate-x-0 translate-y-0 overflow-y-auto p-5 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
          <DialogDescription>Fill in the details below to create a new lead.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {message ? <Alert variant="destructive">{message}</Alert> : null}
            {optionsMessage ? <Alert variant="destructive">{optionsMessage}</Alert> : null}

            <LeadFormSection icon={Info} index={1} title="Basic Information">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Title</FormLabel>
                    <FormControl className="mt-2">
                      <Input placeholder="Enter lead title" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl className="mt-2">
                      <Textarea placeholder="Enter a brief summary about this lead" disabled={isPending} rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl className="mt-2">
                      <SearchableSelect
                        value={field.value}
                        options={sourceOptions}
                        placeholder={isLoadingOptions ? "Loading sources" : "Select source"}
                        searchPlaceholder="Search sources..."
                        disabled={isPending || isLoadingOptions}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </LeadFormSection>

            <LeadFormSection icon={Target} index={2} title="Qualification">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl className="mt-2">
                        <SegmentedOptions
                          value={field.value}
                          options={leadPriorities.map((priority) => ({
                            value: priority,
                            label: leadPriorityLabels[priority],
                          }))}
                          disabled={isPending}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl className="mt-2">
                        <SegmentedOptions
                          value={field.value}
                          options={leadQualifications.map((qualification) => ({
                            value: qualification,
                            label: leadQualificationLabels[qualification],
                          }))}
                          disabled={isPending}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </LeadFormSection>

            <LeadFormSection
              icon={Users}
              index={3}
              title="Contacts"
              action={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setContactDialogOpen(true)}
                >
                  <Plus className="size-4" />
                  Add New Contact
                </Button>
              }
            >
              <FormField
                control={form.control}
                name="existingContactIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Add Existing Contact</FormLabel>
                    <div className="relative mt-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={contactSearchDraft}
                        onChange={(event) => setContactSearchDraft(event.target.value)}
                        placeholder="Search by name, phone or email"
                        disabled={isPending}
                        className="pl-9"
                      />
                    </div>
                    {contactSearch.length >= 2 ? (
                      <div className="mt-3 max-h-44 overflow-y-auto rounded-md border border-border">
                        {contactsQuery.isFetching ? (
                          <p className="p-3 text-sm text-muted-foreground">Searching contacts...</p>
                        ) : null}
                        {!contactsQuery.isFetching && contacts.length === 0 ? (
                          <div className="space-y-3 p-3 text-sm text-muted-foreground">
                            <p>No contacts found.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setContactDialogOpen(true)}
                            >
                              <Plus className="size-4" />
                              Add New Contact
                            </Button>
                          </div>
                        ) : null}
                        {!contactsQuery.isFetching
                          ? contacts.map((contact) => {
                              const selected = existingContactIds.includes(contact.id)

                              return (
                                <button
                                  key={contact.id}
                                  type="button"
                                  className="flex w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                                  onClick={() => toggleExistingContact(contact)}
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {formatDisplayName(contact.fullName || contact.id)}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {[
                                        contact.primaryEmail ? formatEmail(contact.primaryEmail) : null,
                                        contact.primaryPhone ? formatPhoneNumber(contact.primaryPhone) : null,
                                      ].filter(Boolean).join(" - ") || "-"}
                                    </span>
                                  </span>
                                  {selected ? <Badge>Selected</Badge> : null}
                                </button>
                              )
                            })
                          : null}
                      </div>
                    ) : null}
                    {selectedContacts.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedContacts.map((contact) => (
                          <Badge key={contact.id} variant="secondary" className="gap-1.5">
                            {formatDisplayName(contact.fullName || contact.id)}
                            <button type="button" onClick={() => toggleExistingContact(contact)}>
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {newContacts.length ? (
                      <div className="mt-3 space-y-2">
                        {newContacts.map((contact, index) => (
                          <div
                            key={`${contact.firstName}-${contact.lastName}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium">
                                {formatDisplayName(`${contact.firstName} ${contact.lastName}`)}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {contact.emails[0]?.email
                                  ? formatEmail(contact.emails[0].email)
                                  : formatPhoneNumber(contact.phones[0]?.phone)}
                              </span>
                            </span>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeNewContact(index)}>
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </LeadFormSection>

            <LeadFormSection icon={BriefcaseBusiness} index={4} title="Services">
              <FormField
                control={form.control}
                name="serviceIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableMultiSelect
                        value={field.value}
                        options={serviceOptions}
                        placeholder={isLoadingOptions ? "Loading services" : "Select services"}
                        searchPlaceholder="Search services..."
                        disabled={isPending || isLoadingOptions}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </LeadFormSection>

            <LeadFormSection icon={WalletCards} index={5} title="Budget">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Budget</FormLabel>
                      <FormControl className="mt-2">
                        <Input type="number" min="0" placeholder="Min budget" disabled={isPending} value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Budget</FormLabel>
                      <FormControl className="mt-2">
                        <Input type="number" min="0" placeholder="Max budget" disabled={isPending} value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">Enter budget range for this lead</p>
            </LeadFormSection>

            <LeadFormSection icon={Calendar} index={6} title="Expected Closing Date">
              <FormField
                control={form.control}
                name="expectedClosingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </LeadFormSection>

            <DialogFooter className=" bottom-0 -mx-5 -mb-5 border-t border-border bg-background p-5">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isLoadingOptions}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Target className="size-4" />}
                Create Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <LeadContactDialog
          open={contactDialogOpen}
          isPending={isPending}
          onOpenChange={setContactDialogOpen}
          onSubmit={(contactValues) => {
            const parsedContact = leadContactSchema.parse(contactValues)
            form.setValue("newContacts", [...newContacts, parsedContact], {
              shouldDirty: true,
              shouldValidate: true,
            })
            setContactDialogOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

type LeadFormSectionProps = {
  icon: React.ComponentType<{ className?: string }>
  index: number
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

function LeadFormSection({ icon: Icon, index, title, action, children }: LeadFormSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <h3 className="font-semibold text-foreground">
            {index}. {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

type SegmentedOptionsProps<T extends string> = {
  value: T
  options: Array<{ value: T; label: string }>
  disabled?: boolean
  onChange: (value: T) => void
}

function SegmentedOptions<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: SegmentedOptionsProps<T>) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={option.value === value ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className="min-w-0"
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
