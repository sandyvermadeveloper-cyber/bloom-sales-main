import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type {
  Employee,
  EmployeeData,
  EmployeeInviteData,
  EmployeeInviteInput,
  EmployeeProfileUpdateInput,
  EmployeeRoleUpdateInput,
  EmployeeStatusUpdateInput,
  ListEmployeesData,
  ListEmployeesQuery,
} from "@/types/employee"

type EmployeesListResponseData =
  | ListEmployeesData
  | Employee[]
  | {
      items?: Employee[]
      employees?: Employee[]
      pagination?: ListEmployeesData["pagination"]
    }

const normalizeEmployeesList = (
  data: EmployeesListResponseData,
  query: ListEmployeesQuery
): ListEmployeesData => {
  if (Array.isArray(data)) {
    return {
      employees: data,
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

  const employees = data.employees ?? ("items" in data ? data.items : undefined) ?? []

  return {
    employees,
    pagination:
      data.pagination ?? {
        page: query.page,
        limit: query.limit,
        totalItems: employees.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: query.page > 1,
      },
  }
}

export const adminEmployeesApi = {
  async list(query: ListEmployeesQuery) {
    const response = await apiClient.get<ApiSuccess<EmployeesListResponseData>>(
      "/api/v1/admin/employees",
      {
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search || undefined,
          status: query.status,
          role: query.role,
        },
      }
    )

    return {
      ...response.data,
      data: normalizeEmployeesList(response.data.data, query),
    } satisfies ApiSuccess<ListEmployeesData>
  },

  async invite(input: EmployeeInviteInput) {
    const response = await apiClient.post<ApiSuccess<EmployeeInviteData>>(
      "/api/v1/admin/employees",
      input
    )

    return response.data
  },

  async detail(employeeId: string) {
    const response = await apiClient.get<ApiSuccess<EmployeeData>>(
      `/api/v1/admin/employees/${employeeId}`
    )

    return response.data
  },

  async updateProfile(employeeId: string, input: EmployeeProfileUpdateInput) {
    const response = await apiClient.patch<ApiSuccess<EmployeeData>>(
      `/api/v1/admin/employees/${employeeId}`,
      input
    )

    return response.data
  },

  async updateRole(employeeId: string, input: EmployeeRoleUpdateInput) {
    const response = await apiClient.patch<ApiSuccess<EmployeeData>>(
      `/api/v1/admin/employees/${employeeId}/role`,
      input
    )

    return response.data
  },

  async updateStatus(employeeId: string, input: EmployeeStatusUpdateInput) {
    const response = await apiClient.patch<ApiSuccess<EmployeeData>>(
      `/api/v1/admin/employees/${employeeId}/status`,
      input
    )

    return response.data
  },

  async resendInvite(employeeId: string, input: EmployeeInviteInput) {
    const response = await apiClient.post<ApiSuccess<EmployeeInviteData>>(
      `/api/v1/admin/employees/${employeeId}/invite/resend`,
      input
    )

    return response.data
  },
}
