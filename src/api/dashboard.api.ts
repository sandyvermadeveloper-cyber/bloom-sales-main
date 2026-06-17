import { apiClient } from "@/api/client"
import type { ApiSuccess } from "@/types/api"
import type { DashboardData, DashboardQuery } from "@/types/dashboard"

type DashboardResponseData = Omit<DashboardData, "todayFollowUps"> & {
  todayFollowUps?: DashboardData["todayFollowUps"]
  todaysFollowUps?: DashboardData["todayFollowUps"]
}

const normalizeDashboardData = (data: DashboardResponseData): DashboardData => ({
  ...data,
  todayFollowUps: data.todayFollowUps ?? data.todaysFollowUps ?? [],
  upcomingFollowUps: data.upcomingFollowUps ?? [],
  recentLeads: data.recentLeads ?? [],
  quickActions: data.quickActions ?? {
    canCreateLead: false,
    canCreateFollowUp: false,
    canCreateCustomer: false,
    canFindContact: false,
  },
})

export const dashboardApi = {
  async detail(query: DashboardQuery = {}) {
    const response = await apiClient.get<ApiSuccess<DashboardResponseData>>("/api/v1/dashboard", {
      params: {
        employeeId: query.employeeId || undefined,
        startDate: query.startDate || undefined,
        endDate: query.endDate || undefined,
      },
    })

    return {
      ...response.data,
      data: normalizeDashboardData(response.data.data),
    } satisfies ApiSuccess<DashboardData>
  },
}
