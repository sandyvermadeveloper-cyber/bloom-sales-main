import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  CreateLeadInput,
  Lead,
  LeadActivity,
  LeadAttachment,
  LeadAttachmentInput,
  LeadContactLinkInput,
  LeadData,
  LeadNote,
  LeadNoteInput,
  LeadServiceLinkInput,
  LeadStatusChangeInput,
  ListLeadsData,
  ListLeadsQuery,
  UpdateLeadInput,
} from "@/types/lead"

type LeadsListResponseData =
  | Lead[]
  | ListLeadsData
  | {
      items?: Lead[]
      leads?: Lead[]
      pagination?: ListLeadsData["pagination"]
    }

type ResourceListResponseData<T> =
  | T[]
  | {
      items?: T[]
      notes?: T[]
      attachments?: T[]
      activities?: T[]
      pagination?: unknown
    }

const normalizeResourceList = <T>(data: ResourceListResponseData<T>): T[] => {
  if (Array.isArray(data)) return data

  return data.items ?? data.notes ?? data.attachments ?? data.activities ?? []
}

const normalizeLeadsList = (
  data: LeadsListResponseData,
  query: ListLeadsQuery
): ListLeadsData => {
  if (Array.isArray(data)) {
    return {
      leads: data,
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

  const leads = data.leads ?? ("items" in data ? data.items : undefined) ?? []

  return {
    leads,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: leads.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const leadsApi = {
  async list(query: ListLeadsQuery) {
    const response = await apiClient.get<ApiSuccess<LeadsListResponseData>>("/api/v1/leads", {
      params: {
        page: query.page,
        limit: query.limit,
        search: query.search || undefined,
        status: query.status || undefined,
        priority: query.priority || undefined,
        qualification: query.qualification || undefined,
        sourceId: query.sourceId || undefined,
        serviceId: query.serviceId || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    })

    return {
      ...response.data,
      data: normalizeLeadsList(response.data.data, query),
    } satisfies ApiSuccess<ListLeadsData>
  },

  async detail(leadId: string) {
    const response = await apiClient.get<ApiSuccess<LeadData>>(`/api/v1/leads/${leadId}`)

    return response.data
  },

  async create(input: CreateLeadInput) {
    const response = await apiClient.post<ApiSuccess<LeadData>>("/api/v1/leads", input)

    return response.data
  },

  async addContact(leadId: string, input: LeadContactLinkInput) {
    const response = await apiClient.post<ApiSuccess<LeadData>>(
      `/api/v1/leads/${leadId}/contacts`,
      input
    )

    return response.data
  },

  async removeContact(leadId: string, contactId: string) {
    const response = await apiClient.delete<ApiSuccess<LeadData>>(
      `/api/v1/leads/${leadId}/contacts/${contactId}`
    )

    return response.data
  },

  async addService(leadId: string, input: LeadServiceLinkInput) {
    const response = await apiClient.post<ApiSuccess<LeadData>>(
      `/api/v1/leads/${leadId}/services`,
      input
    )

    return response.data
  },

  async update(leadId: string, input: UpdateLeadInput) {
    const response = await apiClient.patch<ApiSuccess<LeadData>>(`/api/v1/leads/${leadId}`, input)

    return response.data
  },

  async delete(leadId: string) {
    const response = await apiClient.delete<ApiSuccess<LeadData>>(`/api/v1/leads/${leadId}`)

    return response.data
  },

  async restore(leadId: string) {
    const response = await apiClient.post<ApiSuccess<LeadData>>(`/api/v1/leads/${leadId}/restore`)

    return response.data
  },

  async changeStatus(leadId: string, input: LeadStatusChangeInput) {
    const response = await apiClient.post<ApiSuccess<LeadData>>(
      `/api/v1/leads/${leadId}/change-status`,
      input
    )

    return response.data
  },

  async activities(leadId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<LeadActivity>>>(
      `/api/v1/leads/${leadId}/activities`,
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
    } satisfies ApiSuccess<LeadActivity[]>
  },

  async notes(leadId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<LeadNote>>>("/api/v1/notes", {
      params: {
        resourceType: "LEAD",
        resourceId: leadId,
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    })

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<LeadNote[]>
  },

  async createNote(input: LeadNoteInput) {
    const response = await apiClient.post<ApiSuccess<LeadNote>>("/api/v1/notes", input)

    return response.data
  },

  async attachments(leadId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<LeadAttachment>>>(
      "/api/v1/attachments",
      {
        params: {
          resourceType: "LEAD",
          resourceId: leadId,
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
    } satisfies ApiSuccess<LeadAttachment[]>
  },

  async attachmentDetail(attachmentId: string) {
    const response = await apiClient.get<ApiSuccess<LeadAttachment>>(
      `/api/v1/attachments/${attachmentId}`
    )

    return response.data
  },

  async createAttachment(input: LeadAttachmentInput) {
    const formData = new FormData()
    formData.append("resourceType", input.resourceType)
    formData.append("resourceId", input.resourceId)
    formData.append("file", input.file)
    if (input.fileName) formData.append("fileName", input.fileName)

    const response = await apiClient.post<ApiSuccess<LeadAttachment>>(
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
    const response = await apiClient.delete<ApiSuccess<null>>(
      `/api/v1/attachments/${attachmentId}`
    )

    return response.data
  },
}
