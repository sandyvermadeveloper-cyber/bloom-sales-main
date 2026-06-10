"use client"

import type { ReactNode } from "react"

import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebar } from "@/hooks/use-sidebar"
import { cn } from "@/lib/utils"
import type { AdminProfile } from "@/types/auth"

type AppLayoutProps = {
  children: ReactNode
  employee: AdminProfile | null
  isLoggingOut?: boolean
  onLogout: () => void
  onLogoutAll: () => void
}

export function AppLayout({ children, employee, isLoggingOut = false, onLogout, onLogoutAll }: AppLayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <TooltipProvider>
      <main
        className={cn(
          "min-h-screen bg-muted/30 [--sidebar-width:280px]",
          isCollapsed && "[--sidebar-width:80px]"
        )}
      >
        <div className="fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-width) transition-[width] duration-200 ease-in-out lg:block">
          <AppSidebar isCollapsed={isCollapsed} />
        </div>

        <MobileSidebar />

        <AppNavbar
          employee={employee}
          isLoggingOut={isLoggingOut}
          onLogout={onLogout}
          onLogoutAll={onLogoutAll}
        />

        <div className="min-h-screen pt-16 transition-[padding] duration-200 ease-in-out lg:pl-(--sidebar-width)">
          <div className="mx-auto w-full max-w-7xl px-4 py-6">{children}</div>
        </div>
      </main>
    </TooltipProvider>
  )
}
