"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Contact,
  Filter,
  RefreshCw,
  Target,
  Users,
  XCircle,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { dashboardApi } from "@/api/dashboard.api"
import {
  followUpStatusBadgeClasses,
  followUpTypeBadgeClasses,
} from "@/components/crm/follow-ups/follow-ups.constants"
import {
  formatFollowUpDateTime,
  getFollowUpAssigneeName,
  getFollowUpStatusLabel,
  getFollowUpTypeLabel,
} from "@/components/crm/follow-ups/follow-ups.utils"
import {
  leadPriorityBadgeClasses,
  leadQualificationBadgeClasses,
  leadStatusBadgeClasses,
} from "@/components/crm/leads/leads.constants"
import {
  formatLeadDate,
  getLeadOwnerName,
  getLeadPriorityLabel,
  getLeadQualificationLabel,
  getLeadSourceName,
  getLeadStatusLabel,
  getLeadTitle,
} from "@/components/crm/leads/leads.utils"
import { TableRefetchButton } from "@/components/shared/table-refetch-button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth.store"
import type { DashboardQuery, DashboardSummary } from "@/types/dashboard"
import type { FollowUp } from "@/types/follow-up"
import type { Lead } from "@/types/lead"
import { getApiErrorMessage } from "@/utils/api-error"
import {
  formatCode,
  formatDescription,
  formatDisplayName,
  formatEmail,
  formatPhoneNumber,
  formatTitleCase,
} from "@/utils/display-format"

const toIsoStartOfDay = (value: string) => (value ? new Date(`${value}T00:00:00.000`).toISOString() : undefined)
const toIsoEndOfDay = (value: string) => (value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined)
const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const
const chartDotClasses = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"] as const

export function DashboardPageClient() {
  const employee = useAuthStore((state) => state.employee)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const query = useMemo<DashboardQuery>(
    () => ({
      startDate: toIsoStartOfDay(startDate),
      endDate: toIsoEndOfDay(endDate),
    }),
    [endDate, startDate]
  )

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", query.startDate ?? "", query.endDate ?? ""],
    queryFn: () => dashboardApi.detail(query),
    staleTime: 60 * 1000,
  })

  const dashboard = dashboardQuery.data?.data

  return (
    <section className="page-section">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">CRM Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Welcome{employee?.firstName ? `, ${formatDisplayName(employee.firstName)}` : ""}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Monitor today&apos;s follow-ups, new CRM leads, active customers, and high-priority sales work.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="date"
                value={startDate}
                aria-label="Dashboard start date"
                className="h-10 bg-background"
                onChange={(event) => setStartDate(event.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                aria-label="Dashboard end date"
                className="h-10 bg-background"
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div> */}
            {(startDate || endDate) ? (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
              >
                <Filter className="size-4" />
                Clear
              </Button>
            ) : null}
            <TableRefetchButton isFetching={dashboardQuery.isFetching} onRefetch={() => dashboardQuery.refetch()} />
          </div>
        </div>
      </div>

      {dashboardQuery.isError ? (
        <Alert variant="destructive">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{getApiErrorMessage(dashboardQuery.error, "Unable to load dashboard data.")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => dashboardQuery.refetch()}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      <SummaryGrid summary={dashboard?.summary} isLoading={dashboardQuery.isLoading} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <KpiChartCard summary={dashboard?.summary} isLoading={dashboardQuery.isLoading} />
        <FollowUpSplitChartCard
          summary={dashboard?.summary}
          todayCount={dashboard?.todayFollowUps.length ?? 0}
          upcomingCount={dashboard?.upcomingFollowUps.length ?? 0}
          isLoading={dashboardQuery.isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <LeadStatusChartCard leads={dashboard?.recentLeads ?? []} isLoading={dashboardQuery.isLoading} />
        <LeadPriorityChartCard leads={dashboard?.recentLeads ?? []} isLoading={dashboardQuery.isLoading} />
      </div>

      <QuickActionsCard quickActions={dashboard?.quickActions} isLoading={dashboardQuery.isLoading} />

      <div className="grid gap-4 xl:grid-cols-2">
        <FollowUpsCard
          title="Today's Follow-Ups"
          description="Scheduled and overdue work for today."
          followUps={dashboard?.todayFollowUps ?? []}
          isLoading={dashboardQuery.isLoading}
        />
        <FollowUpsCard
          title="Upcoming Follow-Ups"
          description="Next scheduled actions coming up."
          followUps={dashboard?.upcomingFollowUps ?? []}
          isLoading={dashboardQuery.isLoading}
        />
      </div>

      <RecentLeadsCard leads={dashboard?.recentLeads ?? []} isLoading={dashboardQuery.isLoading} />
    </section>
  )
}

function SummaryGrid({ summary, isLoading }: { summary?: DashboardSummary; isLoading: boolean }) {
  const stats = [
    {
      label: "Today Follow-Ups",
      value: summary?.todayFollowUpsCount,
      icon: CalendarClock,
      hint: "Tasks scheduled for today",
    },
    {
      label: "Overdue Follow-Ups",
      value: summary?.overdueFollowUpsCount,
      icon: AlertCircle,
      hint: "Needs immediate attention",
      danger: true,
    },
    {
      label: "New CRM Leads",
      value: summary?.newLeadsCount,
      icon: Target,
      hint: "Fresh CRM leads in current scope",
    },
    {
      label: "Active Customers",
      value: summary?.activeCustomersCount,
      icon: Users,
      hint: "Currently active customers",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  stat.danger ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                )}
              >
                <stat.icon className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value ?? 0}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function KpiChartCard({ summary, isLoading }: { summary?: DashboardSummary; isLoading: boolean }) {
  const data = [
    { label: "Today", value: summary?.todayFollowUpsCount ?? 0, fill: chartColors[0] },
    { label: "Overdue", value: summary?.overdueFollowUpsCount ?? 0, fill: chartColors[1] },
    { label: "New CRM Leads", value: summary?.newLeadsCount ?? 0, fill: chartColors[2] },
    { label: "Customers", value: summary?.activeCustomersCount ?? 0, fill: chartColors[3] },
  ]

  return (
    <ChartCard title="KPI Snapshot" description="A quick visual comparison of core dashboard metrics.">
      {isLoading ? (
        <ChartSkeleton />
      ) : hasChartData(data) ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <RechartsTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((item) => (
                  <Cell key={item.label} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState title="No KPI activity yet" description="Dashboard metrics will appear once data is available." />
      )}
    </ChartCard>
  )
}

function FollowUpSplitChartCard({
  summary,
  todayCount,
  upcomingCount,
  isLoading,
}: {
  summary?: DashboardSummary
  todayCount: number
  upcomingCount: number
  isLoading: boolean
}) {
  const data = [
    { label: "Today", value: summary?.todayFollowUpsCount ?? todayCount, fill: chartColors[0], colorClass: chartDotClasses[0] },
    { label: "Upcoming", value: upcomingCount, fill: chartColors[2], colorClass: chartDotClasses[2] },
    { label: "Overdue", value: summary?.overdueFollowUpsCount ?? 0, fill: chartColors[1], colorClass: chartDotClasses[1] },
  ]

  return (
    <ChartCard title="Follow-Up Split" description="Today, upcoming, and overdue follow-up workload.">
      {isLoading ? (
        <ChartSkeleton />
      ) : hasChartData(data) ? (
        <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={86} paddingAngle={4}>
                  {data.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend data={data} />
        </div>
      ) : (
        <ChartEmptyState title="No follow-up split yet" description="Follow-up counts will appear as work is scheduled." />
      )}
    </ChartCard>
  )
}

function LeadStatusChartCard({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
  const data = countLeadField(leads, "status").map((item, index) => ({
    ...item,
    label: getLeadStatusLabel(item.key),
    fill: chartColors[index % chartColors.length],
    colorClass: chartDotClasses[index % chartDotClasses.length],
  }))

  return (
    <ChartCard title="Recent CRM Leads by Status" description="Status distribution from the latest CRM leads returned by dashboard.">
      {isLoading ? (
        <ChartSkeleton />
      ) : hasChartData(data) ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 12, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <RechartsTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((item) => (
                  <Cell key={item.key} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState title="No status data" description="Recent lead status counts will appear here." />
      )}
    </ChartCard>
  )
}

function LeadPriorityChartCard({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
  const data = countLeadField(leads, "priority").map((item, index) => ({
    ...item,
    label: getLeadPriorityLabel(item.key),
    fill: chartColors[(index + 2) % chartColors.length],
    colorClass: chartDotClasses[(index + 2) % chartDotClasses.length],
  }))

  return (
    <ChartCard title="Recent CRM Leads by Priority" description="Priority mix for the latest CRM lead activity.">
      {isLoading ? (
        <ChartSkeleton />
      ) : hasChartData(data) ? (
        <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={84} paddingAngle={4}>
                  {data.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
                <RechartsTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend data={data} />
        </div>
      ) : (
        <ChartEmptyState title="No priority data" description="Recent lead priority counts will appear here." />
      )}
    </ChartCard>
  )
}

function QuickActionsCard({
  quickActions,
  isLoading,
}: {
  quickActions?: {
    canCreateLead: boolean
    canCreateFollowUp: boolean
    canCreateCustomer: boolean
    canFindContact: boolean
  }
  isLoading: boolean
}) {
  const actions = [
    {
      label: "Create CRM Lead",
      description: "Capture a new opportunity",
      href: "/crm/crm-leads",
      enabled: quickActions?.canCreateLead,
      icon: Target,
    },
    {
      label: "Schedule Follow-Up",
      description: "Plan the next customer touch",
      href: "/crm/follow-ups",
      enabled: quickActions?.canCreateFollowUp,
      icon: CalendarClock,
    },
    {
      label: "Create Customer",
      description: "Open customer workspace",
      href: "/crm/customers",
      enabled: quickActions?.canCreateCustomer,
      icon: Users,
    },
    {
      label: "Find Contact",
      description: "Search CRM contacts",
      href: "/crm/contacts",
      enabled: quickActions?.canFindContact,
      icon: Contact,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => (
              <Skeleton key={action.label} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant="outline"
                disabled={!action.enabled}
                className="h-auto justify-start rounded-xl p-4 text-left"
              >
                <Link href={action.href} aria-disabled={!action.enabled}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{action.label}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{action.description}</span>
                  </span>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

function ChartEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div>
        <XCircle className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ChartLegend({ data }: { data: Array<{ label: string; value: number; colorClass: string }> }) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2.5 shrink-0 rounded-full", item.colorClass)} />
            <span className="truncate text-muted-foreground">{item.label}</span>
          </span>
          <span className="font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  label?: string | number
  payload?: Array<{ name?: string; value?: number; payload?: { label?: string } }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const title = item.payload?.label ?? label ?? item.name ?? "Value"

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{title}</p>
      <p className="text-muted-foreground">{item.value ?? 0}</p>
    </div>
  )
}

function hasChartData(data: Array<{ value: number }>) {
  return data.some((item) => item.value > 0)
}

function countLeadField(leads: Lead[], field: "status" | "priority") {
  const counts = new Map<string, number>()

  leads.forEach((lead) => {
    const value = lead[field]

    if (!value) return

    counts.set(value, (counts.get(value) ?? 0) + 1)
  })

  return Array.from(counts.entries()).map(([key, value]) => ({ key, value }))
}

function FollowUpsCard({
  title,
  description,
  followUps,
  isLoading,
}: {
  title: string
  description: string
  followUps: FollowUp[]
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-xl" />)
        ) : followUps.length ? (
          followUps.map((followUp) => <FollowUpItem key={followUp.id} followUp={followUp} />)
        ) : (
          <EmptyState title="No follow-ups found" description="Nothing is scheduled in this section." />
        )}
      </CardContent>
    </Card>
  )
}

function FollowUpItem({ followUp }: { followUp: FollowUp }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/30 p-3",
        followUp.isOverdue && "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {followUp.followUpNumber ? (
              <span className="font-mono text-xs text-muted-foreground">{formatCode(followUp.followUpNumber)}</span>
            ) : null}
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-normal",
                followUpTypeBadgeClasses[followUp.type] ?? "border-border bg-muted text-muted-foreground"
              )}
            >
              {getFollowUpTypeLabel(followUp.type, followUp.customType)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-normal",
                followUpStatusBadgeClasses[followUp.status] ?? "border-border bg-muted text-muted-foreground"
              )}
            >
              {getFollowUpStatusLabel(followUp.status)}
            </Badge>
            {followUp.isOverdue ? (
              <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {followUp.overdueMinutes ? `${followUp.overdueMinutes} min overdue` : "Overdue"}
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-1 text-sm font-semibold">
            {formatTitleCase(followUp.lead?.label || followUp.companyName || followUp.lead?.leadNumber || "Untitled Lead")}
          </p>
          {followUp.notes ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{formatDescription(followUp.notes)}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{formatFollowUpDateTime(followUp.scheduledAt)}</span>
        <span>{getFollowUpAssigneeName(followUp)}</span>
        {followUp.primaryContact?.fullName ? <span>{formatDisplayName(followUp.primaryContact.fullName)}</span> : null}
        {followUp.primaryContact?.primaryPhone ? <span>{formatPhoneNumber(followUp.primaryContact.primaryPhone)}</span> : null}
      </div>
      {followUp.lead?.priority || followUp.lead?.status || followUp.lead?.qualification ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {followUp.lead?.priority ? (
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-normal",
                leadPriorityBadgeClasses[followUp.lead.priority] ?? "border-border bg-muted text-muted-foreground"
              )}
            >
              {getLeadPriorityLabel(followUp.lead.priority)}
            </Badge>
          ) : null}
          {followUp.lead?.status ? (
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-normal",
                leadStatusBadgeClasses[followUp.lead.status] ?? "border-border bg-muted text-muted-foreground"
              )}
            >
              {getLeadStatusLabel(followUp.lead.status)}
            </Badge>
          ) : null}
          {followUp.lead?.qualification ? (
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-normal",
                leadQualificationBadgeClasses[followUp.lead.qualification] ??
                  "border-border bg-muted text-muted-foreground"
              )}
            >
              {formatTitleCase(followUp.lead.qualification)}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function RecentLeadsCard({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recent CRM Leads</CardTitle>
          <p className="text-sm text-muted-foreground">Latest CRM opportunities from your dashboard scope.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/crm/crm-leads">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : leads.length ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <EmptyState title="No recent CRM leads" description="New CRM leads will appear here." />
        )}
      </CardContent>
    </Card>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{formatCode(lead.leadNumber)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{getLeadTitle(lead)}</h3>
        </div>
        {lead.status ? (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 px-2 py-0.5 font-normal",
              leadStatusBadgeClasses[lead.status] ?? "border-border bg-muted text-muted-foreground"
            )}
          >
            {getLeadStatusLabel(lead.status)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.priority ? (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 font-normal",
              leadPriorityBadgeClasses[lead.priority] ?? "border-border bg-muted text-muted-foreground"
            )}
          >
            {getLeadPriorityLabel(lead.priority)}
          </Badge>
        ) : null}
        {lead.qualification ? (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 font-normal",
              leadQualificationBadgeClasses[lead.qualification] ?? "border-border bg-muted text-muted-foreground"
            )}
          >
            {getLeadQualificationLabel(lead.qualification)}
          </Badge>
        ) : null}
      </div>

      <dl className="mt-4 space-y-2 text-xs">
        <InfoRow label="Owner" value={getLeadOwnerName(lead)} />
        <InfoRow label="Source" value={getLeadSourceName(lead)} />
        <InfoRow label="Contact" value={formatDisplayName(lead.primaryContact?.fullName)} />
        <InfoRow label="Phone" value={formatPhoneNumber(lead.primaryContact?.primaryPhone)} />
        <InfoRow label="Email" value={formatEmail(lead.primaryContact?.primaryEmail)} />
        <InfoRow label="Expected Close" value={formatLeadDate(lead.expectedClosingDate)} />
        <InfoRow label="Created" value={formatLeadDate(lead.createdAt)} />
        {lead.convertedAt ? <InfoRow label="Converted" value={formatLeadDate(lead.convertedAt)} /> : null}
        {lead.closedAt ? <InfoRow label="Closed" value={formatLeadDate(lead.closedAt)} /> : null}
        {lead.lossReason || lead.customLossReason ? (
          <InfoRow
            label="Loss Reason"
            value={formatTitleCase(lead.customLossReason || lead.lossReason)}
          />
        ) : null}
      </dl>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <XCircle className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
