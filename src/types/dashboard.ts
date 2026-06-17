import type { FollowUp } from "@/types/follow-up"
import type { Lead } from "@/types/lead"

export type DashboardSummary = {
  todayFollowUpsCount: number
  overdueFollowUpsCount: number
  newLeadsCount: number
  activeCustomersCount: number
}

export type DashboardData = {
  summary: DashboardSummary
  todayFollowUps: FollowUp[]
  upcomingFollowUps: FollowUp[]
  recentLeads: Lead[]
  quickActions: {
    canCreateLead: boolean
    canCreateFollowUp: boolean
    canCreateCustomer: boolean
    canFindContact: boolean
  }
}

export type DashboardQuery = {
  employeeId?: string
  startDate?: string
  endDate?: string
}
