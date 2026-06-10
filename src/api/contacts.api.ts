import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  Contact,
  ContactData,
  ContactEmailInput,
  ContactPhoneInput,
  ContactProfileInput,
  ListContactsData,
  ListContactsQuery,
} from "@/types/contact"

type ContactsListResponseData =
  | Contact[]
  | ListContactsData
  | {
      items?: Contact[]
      contacts?: Contact[]
      pagination?: ListContactsData["pagination"]
    }

const normalizeContactsList = (
  data: ContactsListResponseData,
  query: ListContactsQuery
): ListContactsData => {
  if (Array.isArray(data)) {
    return {
      contacts: data,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems: data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
    }
  }

  const contacts = data.contacts ?? ("items" in data ? data.items : undefined) ?? []

  return {
    contacts,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: contacts.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const contactsApi = {
  async list(query: ListContactsQuery) {
    const response = await apiClient.get<ApiSuccess<ContactsListResponseData>>(
      "/api/v1/contacts",
      {
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search || undefined,
          phone: query.phone || undefined,
          email: query.email || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }
    )

    return {
      ...response.data,
      data: normalizeContactsList(response.data.data, query),
    } satisfies ApiSuccess<ListContactsData>
  },

  async detail(contactId: string) {
    const response = await apiClient.get<ApiSuccess<Contact>>(`/api/v1/contacts/${contactId}`)

    return response.data
  },

  async find(params: { email?: string; phone?: string }) {
    const response = await apiClient.get<ApiSuccess<Contact>>("/api/v1/contacts/find", {
      params: {
        email: params.email || undefined,
        phone: params.phone || undefined,
      },
    })

    return response.data
  },

  async update(contactId: string, input: ContactProfileInput) {
    const response = await apiClient.patch<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}`,
      input
    )

    return response.data
  },

  async addPhone(contactId: string, input: ContactPhoneInput) {
    const response = await apiClient.post<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}/phones`,
      input
    )

    return response.data
  },

  async deletePhone(contactId: string, phoneId: string) {
    const response = await apiClient.delete<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}/phones/${phoneId}`
    )

    return response.data
  },

  async addEmail(contactId: string, input: ContactEmailInput) {
    const response = await apiClient.post<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}/emails`,
      input
    )

    return response.data
  },

  async deleteEmail(contactId: string, emailId: string) {
    const response = await apiClient.delete<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}/emails/${emailId}`
    )

    return response.data
  },

  async delete(contactId: string) {
    const response = await apiClient.delete<ApiSuccess<ContactData>>(`/api/v1/contacts/${contactId}`)

    return response.data
  },

  async restore(contactId: string) {
    const response = await apiClient.post<ApiSuccess<ContactData>>(
      `/api/v1/contacts/${contactId}/restore`
    )

    return response.data
  },
}
