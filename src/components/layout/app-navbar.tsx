"use client"

import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserMenu } from "@/components/layout/user-menu"
import { useSidebar } from "@/hooks/use-sidebar"
import type { AdminProfile } from "@/types/auth"

type AppNavbarProps = {
  employee: AdminProfile | null
  isLoggingOut?: boolean
  onLogout: () => void
  onLogoutAll: () => void
}

export function AppNavbar({ employee, isLoggingOut = false, onLogout, onLogoutAll }: AppNavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { isCollapsed, toggleCollapsed, setMobileOpen } = useSidebar()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:left-(--sidebar-width)">
      <div className="flex h-full items-center gap-3 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="lg:hidden"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="hidden lg:inline-flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleCollapsed}
            >
              {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
        </Tooltip>

        {/* <div className="hidden w-full max-w-md items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="h-9 pl-9"
              aria-label="Search dashboard"
            />
          </div>
        </div> */}

        <div className="ml-auto flex items-center gap-1">
          {/* <Button type="button" variant="ghost" size="icon-lg" aria-label="Notifications">
            <Bell className="size-5" />
          </Button> */}

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <Sun className="hidden size-5 dark:block text-[var(--warning)]" />
            <Moon className="size-5 dark:hidden" />
          </Button>

          <UserMenu
            employee={employee}
            isLoggingOut={isLoggingOut}
            onLogout={onLogout}
            onLogoutAll={onLogoutAll}
          />
        </div>
      </div>
    </header>
  )
}
