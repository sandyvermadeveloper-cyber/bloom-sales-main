import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  LeadSource,
  LeadSourceData,
  LeadSourceInput,
  ListLeadSourcesData,
  ListLeadSourcesQuery,
} from "@/types/lead-source"

type LeadSourcesListResponseData =
  | LeadSource[]
  | ListLeadSourcesData
  | {
      items?: LeadSource[]
      leadSources?: LeadSource[]
      sources?: LeadSource[]
      pagination?: ListLeadSourcesData["pagination"]
    }

const normalizeLeadSourcesList = (
  data: LeadSourcesListResponseData,
  query: ListLeadSourcesQuery
): ListLeadSourcesData => {
  if (Array.isArray(data)) {
    return {
      leadSources: data,
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

  const leadSources =
    data.leadSources ??
    ("sources" in data ? data.sources : undefined) ??
    ("items" in data ? data.items : undefined) ??
    []

  return {
    leadSources,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: leadSources.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const leadSourcesApi = {
  async list(query: ListLeadSourcesQuery) {
    const response = await apiClient.get<ApiSuccess<LeadSourcesListResponseData>>(
      "/api/v1/lead-sources",
      {
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }
    )

    return {
      ...response.data,
      data: normalizeLeadSourcesList(response.data.data, query),
    } satisfies ApiSuccess<ListLeadSourcesData>
  },

  async create(input: LeadSourceInput) {
    const response = await apiClient.post<ApiSuccess<LeadSourceData>>(
      "/api/v1/lead-sources",
      input
    )

    return response.data
  },

  async update(sourceId: string, input: LeadSourceInput) {
    const response = await apiClient.patch<ApiSuccess<LeadSourceData>>(
      `/api/v1/lead-sources/${sourceId}`,
      input
    )

    return response.data
  },

  async delete(sourceId: string) {
    const response = await apiClient.delete<ApiSuccess<LeadSourceData>>(
      `/api/v1/lead-sources/${sourceId}`
    )

    return response.data
  },

  async restore(sourceId: string) {
    const response = await apiClient.post<ApiSuccess<LeadSourceData>>(
      `/api/v1/lead-sources/${sourceId}/restore`
    )

    return response.data
  },
}
