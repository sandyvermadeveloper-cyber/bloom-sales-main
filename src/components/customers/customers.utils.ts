import {
  customerPageSizeOptions,
  customerStatusLabels,
  customerStatuses,
  customerTypeLabels,
  customerTypes,
  defaultCustomerPageSize,
} from "@/components/customers/customers.constants"
import type { CustomerFormValues, CustomerUpdateFormValues } from "@/schemas/customer.schemas"
import type {
  Customer,
  CustomerStatus,
  CustomerType,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer"
import { getApiErrorMessage } from "@/utils/api-error"
import { formatTitleCase } from "@/utils/display-format"

export const parseCustomerPage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const parseCustomerLimit = (value: string | null): (typeof customerPageSizeOptions)[number] => {
  const limit = Number(value)
  return customerPageSizeOptions.includes(limit as (typeof customerPageSizeOptions)[number])
    ? (limit as (typeof customerPageSizeOptions)[number])
    : defaultCustomerPageSize
}

export const normalizeCustomerSearch = (value: string | null) => {
  const search = value?.trim() ?? ""
  return search.length >= 2 ? search : ""
}

export const parseCustomerStatus = (value: string | null): CustomerStatus | "all" => {
  return customerStatuses.includes(value as CustomerStatus) ? (value as CustomerStatus) : "all"
}

export const parseCustomerType = (value: string | null): CustomerType | "all" => {
  return customerTypes.includes(value as CustomerType) ? (value as CustomerType) : "all"
}

export const getCustomerName = (customer: Customer) => {
  return formatTitleCase(customer.name || "Unnamed customer")
}

export const getCustomerOwnerName = (customer: Customer) => {
  return formatTitleCase(customer.owner?.name || "-")
}

export const getCustomerPrimaryContact = (customer: Customer) => {
  return customer.primaryContact ?? customer.contacts?.[0] ?? null
}

export const getCustomerTypeLabel = (customerType?: string) => {
  if (!customerType) return "-"

  return customerTypeLabels[customerType] ?? customerType.replaceAll("_", " ")
}

export const getCustomerStatusLabel = (status?: string) => {
  if (!status) return "-"

  return customerStatusLabels[status] ?? status.replaceAll("_", " ")
}

export const getCustomerApiMessage = (error: unknown, fallback: string) => {
  return getApiErrorMessage(error, fallback)
}

export const formatCustomerDate = (value?: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const customerToUpdateFormValues = (customer: Customer): CustomerUpdateFormValues => ({
  name: customer.name ?? "",
  customerType:
    customer.customerType === "BUSINESS" || customer.customerType === "INDIVIDUAL"
      ? customer.customerType
      : "BUSINESS",
})

export const customerFormToCreateInput = (values: CustomerFormValues): CreateCustomerInput => ({
  name: values.name,
  customerType: values.customerType,
  ownerEmployeeId: values.ownerEmployeeId || undefined,
  newContacts: values.newContacts.length
    ? values.newContacts.map((contact) => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        designation: contact.designation || undefined,
        phones: contact.phones.map((phone) => ({
          phone: phone.phone,
          label: phone.label,
        })),
        emails: contact.emails.map((email) => ({
          email: email.email,
          label: email.label,
        })),
      }))
    : undefined,
})

export const customerFormToUpdateInput = (values: CustomerUpdateFormValues): UpdateCustomerInput => ({
  name: values.name,
  customerType: values.customerType,
})
