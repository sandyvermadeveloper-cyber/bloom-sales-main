import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  AssignFollowUpInput,
  CancelFollowUpInput,
  CompleteFollowUpInput,
  CreateFollowUpInput,
  FollowUp,
  FollowUpAttachment,
  FollowUpAttachmentInput,
  FollowUpData,
  FollowUpNote,
  FollowUpNoteInput,
  FollowUpNoteUpdateInput,
  FollowUpStats,
  ListFollowUpsData,
  ListFollowUpsQuery,
  ReopenFollowUpInput,
  RescheduleFollowUpInput,
  UpdateFollowUpInput,
} from "@/types/follow-up"

type FollowUpsListResponseData =
  | FollowUp[]
  | ListFollowUpsData
  | {
      items?: FollowUp[]
      followUps?: FollowUp[]
      pagination?: ListFollowUpsData["pagination"]
    }

type ResourceListResponseData<T> =
  | T[]
  | {
      items?: T[]
      notes?: T[]
      attachments?: T[]
      pagination?: unknown
    }

const normalizeResourceList = <T>(data: ResourceListResponseData<T>): T[] => {
  if (Array.isArray(data)) return data

  return data.items ?? data.notes ?? data.attachments ?? []
}

const normalizeFollowUpsList = (
  data: FollowUpsListResponseData,
  query: ListFollowUpsQuery
): ListFollowUpsData => {
  if (Array.isArray(data)) {
    return {
      followUps: data,
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

  const followUps = data.followUps ?? ("items" in data ? data.items : undefined) ?? []

  return {
    followUps,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: followUps.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const followUpsApi = {
  async list(query: ListFollowUpsQuery) {
    const response = await apiClient.get<ApiSuccess<FollowUpsListResponseData>>("/api/v1/follow-ups", {
      params: {
        page: query.page,
        limit: query.limit,
        leadId: query.leadId || undefined,
        status: query.status || undefined,
        assignedToEmployeeId: query.assignedToEmployeeId || undefined,
        search: query.search || undefined,
        scheduledFrom: query.scheduledFrom || undefined,
        scheduledTo: query.scheduledTo || undefined,
        sortBy: query.sortBy ?? "scheduledAt",
        sortOrder: query.sortOrder ?? "asc",
        view: query.view || undefined,
        timezoneOffset: query.timezoneOffset,
      },
    })

    return {
      ...response.data,
      data: normalizeFollowUpsList(response.data.data, query),
    } satisfies ApiSuccess<ListFollowUpsData>
  },

  async stats(timezoneOffset?: number) {
    const response = await apiClient.get<ApiSuccess<FollowUpStats>>("/api/v1/follow-ups/stats", {
      params: {
        timezoneOffset,
      },
      headers:
        typeof timezoneOffset === "number"
          ? { "x-client-timezone-offset": String(timezoneOffset) }
          : undefined,
    })

    return response.data
  },

  async detail(followUpId: string) {
    const response = await apiClient.get<ApiSuccess<FollowUpData>>(`/api/v1/follow-ups/${followUpId}`)

    return response.data
  },

  async create(input: CreateFollowUpInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>("/api/v1/follow-ups", input)

    return response.data
  },

  async update(followUpId: string, input: UpdateFollowUpInput) {
    const response = await apiClient.patch<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}`,
      input
    )

    return response.data
  },

  async assign(followUpId: string, input: AssignFollowUpInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/assign`,
      input
    )

    return response.data
  },

  async complete(followUpId: string, input: CompleteFollowUpInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/complete`,
      input
    )

    return response.data
  },

  async reschedule(followUpId: string, input: RescheduleFollowUpInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/reschedule`,
      input
    )

    return response.data
  },

  async cancel(followUpId: string, input: CancelFollowUpInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/cancel`,
      input
    )

    return response.data
  },

  async reopen(followUpId: string, input: ReopenFollowUpInput = {}) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/reopen`,
      input
    )

    return response.data
  },

  async markMissed(followUpId: string) {
    const response = await apiClient.post<ApiSuccess<FollowUpData>>(
      `/api/v1/follow-ups/${followUpId}/missed`,
      {}
    )

    return response.data
  },

  async notes(followUpId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<FollowUpNote>>>("/api/v1/notes", {
      params: {
        resourceType: "FOLLOW_UP",
        resourceId: followUpId,
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    })

    return {
      ...response.data,
      data: normalizeResourceList(response.data.data),
    } satisfies ApiSuccess<FollowUpNote[]>
  },

  async createNote(input: FollowUpNoteInput) {
    const response = await apiClient.post<ApiSuccess<FollowUpNote>>("/api/v1/notes", input)

    return response.data
  },

  async updateNote(noteId: string, input: FollowUpNoteUpdateInput) {
    const response = await apiClient.patch<ApiSuccess<{ id: string }>>(`/api/v1/notes/${noteId}`, input)

    return response.data
  },

  async deleteNote(noteId: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(`/api/v1/notes/${noteId}`)

    return response.data
  },

  async attachments(followUpId: string) {
    const response = await apiClient.get<ApiSuccess<ResourceListResponseData<FollowUpAttachment>>>(
      "/api/v1/attachments",
      {
        params: {
          resourceType: "FOLLOW_UP",
          resourceId: followUpId,
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
    } satisfies ApiSuccess<FollowUpAttachment[]>
  },

  async attachmentDetail(attachmentId: string) {
    const response = await apiClient.get<ApiSuccess<FollowUpAttachment>>(
      `/api/v1/attachments/${attachmentId}`
    )

    return response.data
  },

  async createAttachment(input: FollowUpAttachmentInput) {
    const formData = new FormData()
    formData.append("resourceType", input.resourceType)
    formData.append("resourceId", input.resourceId)
    formData.append("file", input.file)
    if (input.fileName) formData.append("fileName", input.fileName)

    const response = await apiClient.post<ApiSuccess<FollowUpAttachment>>(
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
