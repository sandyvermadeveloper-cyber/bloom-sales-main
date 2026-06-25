"use client"

import { BookUser, Building2, CalendarClock, LayoutDashboard, MapPin, Settings, Target, User, Users, Wrench } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

import { Button } from "@/components/ui/button"
import { SidebarItem, type SidebarNavItem } from "@/components/layout/sidebar-item"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navigationItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "CRM Leads",
    href: "/crm/crm-leads",
    icon: Target,
  },
  {
    title: "Follow-Ups",
    href: "/crm/follow-ups",
    icon: CalendarClock,
  },
  {
    title: "Contacts",
    href: "/crm/contacts",
    icon: BookUser,
  },
  {
    title: "Customers",
    href: "/crm/customers",
    icon: Building2,
  },
  {
    title: "Services",
    href: "/crm/services",
    icon: Wrench,
  },
  {
    title: "Lead Sources",
    href: "/crm/lead-sources",
    icon: MapPin,
  },
  // {
  //   title: "Buyouter",
  //   href: "/buyouter",
  //   icon: ShoppingBag,
  // },
  {
    title: "Settings",
    icon: Settings,
    items: [
      // {
      //   title: "Account",
      //   href: "/settings/account",
      // },
      {
        title: "Security",
        href: "/settings/security",
      },
    ],
  },
]

type AppSidebarProps = {
  isCollapsed?: boolean
  onNavigate?: () => void
  className?: string
}

function AppSidebarComponent({ isCollapsed = false, onNavigate, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
      aria-label="Primary navigation"
    >
      {/* <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
        <Button
          asChild
          variant="ghost"
          className={cn("h-10 w-full justify-start gap-3 px-2", isCollapsed && "justify-center px-0")}
          aria-label="Bloom Sales dashboard"
        >
          <Link href="/" onClick={onNavigate}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              B
            </span>
            {!isCollapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-none">Bloom Sales</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">Admin Panel</span>
              </span>
            ) : null}
          </Link>
        </Button>
      </div> */}
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
        <Button
          asChild
          variant="ghost"
          className={cn("h-15 w-full justify-start gap-3 bg-[#070114] hover:bg-[#070114] px-2", isCollapsed && "justify-center px-0")}  
          aria-label="Bloom Sales dashboard"
        >
          {/* <Link href="/" onClick={onNavigate}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              B
            </span>
            {!isCollapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-none">Bloom Sales</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">Admin Panel</span>
              </span>
            ) : null}
          </Link> */}
          <Link href="/" onClick={onNavigate} className="flex items-center justify-center">
            <div className="relative h-22 w-46">
              <Image
                src="/logo.png"
                alt="Bloom Sales"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.href ?? item.title}
            item={item}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  )
}

export const AppSidebar = memo(AppSidebarComponent)
