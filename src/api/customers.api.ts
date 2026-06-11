import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  Customer,
  CustomerActivity,
  CustomerAssignInput,
  CustomerAssignment,
  CustomerAttachment,
  CustomerAttachmentInput,
  CustomerContactLinkInput,
  CustomerData,
  CustomerNote,
  CustomerNoteInput,
  CustomerStatusChangeInput,
  CreateCustomerInput,
  ListCustomersData,
  ListCustomersQuery,
  UpdateCustomerInput,
} from "@/types/customer"

type CustomersListResponseData =
  | Customer[]
  | ListCustomersData
  | {
      items?: Customer[]
      customers?: Customer[]
      pagination?: ListCustomersData["pagination"]
    }

type ResourceListResponseData<T> =
  | T[]
  | {
      items?: T[]
      notes?: T[]
      attachments?: T[]
      activities?: T[]
      assignments?: T[]
      pagination?: unknown
    }

const normalizeResourceList = <T>(data: ResourceListResponseData<T>): T[] => {
  if (Array.isArray(data)) return data

  return data.items ?? data.notes ?? data.attachments ?? data.activities ?? data.assignments ?? []
}

const normalizeCustomersList = (
  data: CustomersListResponseData,
  query: ListCustomersQuery
): ListCustomersData => {
  if (Array.isArray(data)) {
    return {
      customers: data,
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

  const customers = data.customers ?? ("items" in data ? data.items : undefined) ?? []

  return {
    customers,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: customers.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const customersApi = {
  async list(query: ListCustomersQuery) {
    const response = await apiClient.get<ApiSuccess<CustomersListResponseData>>("/api/v1/customers", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        status: query.status || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    })

    return {
      ...response.data,
      data: normalizeCustomersList(response.data.data, query),
    } satisfies ApiSuccess<ListCustomersData>
  },

  async detail(customerId: string) {
    const response = await apiClient.get<ApiSuccess<CustomerData>>(`/api/v1/customers/${customerId}`)

    return response.data
  },

  async create(input: CreateCustomerInput) {
    const response = await apiClient.post<ApiSuccess<CustomerData>>("/api/v1/customers", input)

    return response.data
  },

  async update(customerId: string, input: UpdateCustomerInput) {
    const response = await apiClient.patch<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}`,
      input
    )

    return response.data
  },

  async delete(customerId: string) {
    const response = await apiClient.delete<ApiSuccess<CustomerData>>(`/api/v1/customers/${customerId}`)

    return response.data
  },

  async restore(customerId: string) {
    const response = await apiClient.post<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}/restore`
    )

    return response.data
  },

  async assign(customerId: string, input: CustomerAssignInput) {
    const response = await apiClient.post<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}/assign`,
      input
    )

    return response.data
  },

  async assignments(customerId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<CustomerAssignment>>>(
      `/api/v1/customers/${customerId}/assignments`,
      {
        params: {
          page: 1,
          limit: 20,
        },
      }
    )

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<CustomerAssignment[]>
  },

  async changeStatus(customerId: string, input: CustomerStatusChangeInput) {
    const response = await apiClient.post<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}/change-status`,
      input
    )

    return response.data
  },

  async addContact(customerId: string, input: CustomerContactLinkInput) {
    const response = await apiClient.post<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}/contacts`,
      input
    )

    return response.data
  },

  async removeContact(customerId: string, contactId: string) {
    const response = await apiClient.delete<ApiSuccess<CustomerData>>(
      `/api/v1/customers/${customerId}/contacts/${contactId}`
    )

    return response.data
  },

  async activities(customerId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<CustomerActivity>>>(
      `/api/v1/customers/${customerId}/activities`,
      {
        params: {
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }
    )

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<CustomerActivity[]>
  },

  async notes(customerId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<CustomerNote>>>(
      "/api/v1/notes",
      {
        params: {
          resourceType: "CUSTOMER",
          resourceId: customerId,
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }
    )

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<CustomerNote[]>
  },

  async createNote(input: CustomerNoteInput) {
    const response = await apiClient.post<ApiSuccess<CustomerNote>>("/api/v1/notes", input)

    return response.data
  },

  async attachments(customerId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<CustomerAttachment>>>(
      "/api/v1/attachments",
      {
        params: {
          resourceType: "CUSTOMER",
          resourceId: customerId,
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }
    )

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<CustomerAttachment[]>
  },

  async attachmentDetail(attachmentId: string) {
    const response = await apiClient.get<ApiSuccess<CustomerAttachment>>(
      `/api/v1/attachments/${attachmentId}`
    )

    return response.data
  },

  async createAttachment(input: CustomerAttachmentInput) {
    const formData = new FormData()
    formData.append("resourceType", input.resourceType)
    formData.append("resourceId", input.resourceId)
    formData.append("file", input.file)
    if (input.fileName) formData.append("fileName", input.fileName)

    const response = await apiClient.post<ApiSuccess<CustomerAttachment>>(
      "/api/v1/attachments",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    )

    return response.data
  },

  async deleteAttachment(attachmentId: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(`/api/v1/attachments/${attachmentId}`)

    return response.data
  },
}
