import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  ListServicesData,
  ListServicesQuery,
  Service,
  ServiceData,
  ServiceInput,
} from "@/types/service"

type ServicesListResponseData =
  | Service[]
  | ListServicesData
  | {
      items?: Service[]
      services?: Service[]
      pagination?: ListServicesData["pagination"]
    }

const normalizeServicesList = (
  data: ServicesListResponseData,
  query: ListServicesQuery
): ListServicesData => {
  if (Array.isArray(data)) {
    return {
      services: data,
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

  const services = data.services ?? ("items" in data ? data.items : undefined) ?? []

  return {
    services,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: services.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const servicesApi = {
  async list(query: ListServicesQuery) {
    const response = await apiClient.get<ApiSuccess<ServicesListResponseData>>(
      "/api/v1/services",
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
      data: normalizeServicesList(response.data.data, query),
    } satisfies ApiSuccess<ListServicesData>
  },

  async create(input: ServiceInput) {
    const response = await apiClient.post<ApiSuccess<ServiceData>>("/api/v1/services", input)

    return response.data
  },

  async update(serviceId: string, input: ServiceInput) {
    const response = await apiClient.patch<ApiSuccess<ServiceData>>(
      `/api/v1/services/${serviceId}`,
      input
    )

    return response.data
  },

  async delete(serviceId: string) {
    const response = await apiClient.delete<ApiSuccess<ServiceData>>(
      `/api/v1/services/${serviceId}`
    )

    return response.data
  },

  async restore(serviceId: string) {
    const response = await apiClient.post<ApiSuccess<ServiceData>>(
      `/api/v1/services/${serviceId}/restore`
    )

    return response.data
  },
}
