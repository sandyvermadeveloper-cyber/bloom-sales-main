"use client"

import { Briefcase, Mail, ShieldCheck, User } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth.store"

const statItems = [
  {
    label: "Signed in as",
    icon: Mail,
    key: "email",
  },
  {
    label: "Role",
    icon: ShieldCheck,
    key: "role",
  },
  {
    label: "Employee code",
    icon: Briefcase,
    key: "employeeCode",
  },
] as const

export default function DashboardPage() {
  const employee = useAuthStore((state) => state.employee)

  return (
    <section className="page-section">
      {/* Page header */}
      <div className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome{employee?.firstName ? `, ${employee.firstName}` : ""}. Your admin session is active.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map(({ label, icon: Icon, key }) => (
          <Card key={key} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {key === "role" ? (
                <Badge variant="secondary" className="capitalize">
                  {employee?.[key] ?? "—"}
                </Badge>
              ) : (
                <p className="truncate text-sm font-medium text-foreground">
                  {employee?.[key] ?? "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <CardTitle>
                {employee?.displayName ?? employee?.firstName ?? "Admin"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{employee?.email ?? ""}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are signed in to the Bloom Sales admin panel. Use the navigation above to manage your session and access admin features.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
