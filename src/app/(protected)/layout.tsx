"use client"

import type { ReactNode } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthSession } from "@/hooks/use-auth-session"
import { useAuthStore } from "@/stores/auth.store"
import { getLoginPathWithRedirect } from "@/utils/auth-redirect"

function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Skeleton header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="page-container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </header>
      <div className="page-container py-6">
        <div className="space-y-4">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthFailure, isError, isLoading, isRedirectingToLogin, refetch } = useAuthSession()
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

  if ((isAuthFailure || isLoading || isRedirectingToLogin) && !employee) {
    return <LoadingScreen />
  }

  if (isError && !employee) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              B
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Bloom Sales</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Separator />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Unable to load session</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again, or clear this browser session and sign in again.
            </p>
          </div>
          <Alert variant="destructive">Your session could not be verified. Please try again.</Alert>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="size-3.5" />
              Try again
            </Button>
            <Button size="sm" variant="outline" onClick={() => logoutMutation.mutate()}>
              Sign out
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <AppLayout
      employee={employee}
      isLoggingOut={logoutMutation.isPending || logoutAllMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
      onLogoutAll={() => logoutAllMutation.mutate()}
    >
      {children}
    </AppLayout>
  )
}
