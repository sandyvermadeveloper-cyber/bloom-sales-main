"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Briefcase, Calendar, Clock, LogOut, Mail, MonitorOff, Phone, ShieldCheck, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { RoleBadge } from "@/components/shared/role-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth.store"
import { getLoginPathWithRedirect } from "@/utils/auth-redirect"
import { formatCode, formatDisplayName, formatEmail, formatPhoneNumber } from "@/utils/display-format"

type InfoRowProps = {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border/40 py-3.5 last:border-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const employee = useAuthStore((state) => state.employee)
  const logout = useAuthStore((state) => state.logout)
  const logoutAll = useAuthStore((state) => state.logoutAll)

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear()
      router.replace(getLoginPathWithRedirect(`${window.location.pathname}${window.location.search}`))
    },
  })

  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
    },
  })

  const isLoggingOut = logoutMutation.isPending || logoutAllMutation.isPending

  if (!employee) return null

  const initials = employee.displayName
    ? employee.displayName.split(" ").map((name) => name[0]).join("").toUpperCase().slice(0, 2)
    : `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()

  const fullName = formatDisplayName(employee.displayName ?? `${employee.firstName} ${employee.lastName}`.trim())
  const email = formatEmail(employee.email)
  const phone = employee.phone ? formatPhoneNumber(employee.phone) : null
  const employeeCode = formatCode(employee.employeeCode)

  const lastLogin = employee.lastLoginAt
    ? new Date(employee.lastLoginAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never"

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and security settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card className="overflow-hidden border-border/50 p-0 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

            <CardContent className="relative px-6 pb-6 pt-0">
              <div className="-mt-12 mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-60 blur-md" />
                  <Avatar className="relative size-24 shadow-xl ring-4 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                <p className="break-all text-sm text-muted-foreground">{email}</p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <RoleBadge role={employee.role} showIcon className="px-3 py-0.5 text-xs font-medium" />
                <StatusBadge status={employee.status} className="px-3 py-0.5 text-xs font-medium" />
              </div>

              <div className="mt-6 space-y-2.5 rounded-xl bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" />
                    Last login
                  </span>
                  <span className="font-medium text-foreground">{lastLogin}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="size-3.5" />
                    Employee ID
                  </span>
                  <span className="rounded bg-background/50 px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                    {employeeCode}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoggingOut}
                  onClick={() => logoutMutation.mutate()}
                  className="w-full justify-center gap-2 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoggingOut}
                  onClick={() => logoutAllMutation.mutate()}
                  className="w-full justify-center gap-2 transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <MonitorOff className="size-4" />
                  Sign out everywhere
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-info" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Security tip</p>
                  <p className="text-xs text-muted-foreground">
                    Signing out everywhere will end all your active sessions across all devices and browsers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="border-border/50 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="size-5 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <InfoRow icon={User} label="Full name" value={fullName} />
              <InfoRow
                icon={Mail}
                label="Email address"
                value={
                  <a href={`mailto:${employee.email}`} className="text-primary hover:underline">
                    {email}
                  </a>
                }
              />
              <InfoRow
                icon={Phone}
                label="Phone number"
                value={phone || <span className="text-muted-foreground italic">Not provided</span>}
              />
              <InfoRow icon={Briefcase} label="Employee code" value={employeeCode} />
              <InfoRow icon={ShieldCheck} label="Role" value={<RoleBadge role={employee.role} />} />
              <InfoRow icon={Calendar} label="Last sign in" value={lastLogin} />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
