"use client"

import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { memo, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/stores/sidebar-store"

export type SidebarNavItem = {
  title: string
  href?: string
  icon: LucideIcon
  items?: Array<{
    title: string
    href: string
  }>
}

type SidebarItemProps = {
  item: SidebarNavItem
  isCollapsed?: boolean
  onNavigate?: () => void
}

function SidebarItemComponent({ item, isCollapsed = false, onNavigate }: SidebarItemProps) {
  const pathname = usePathname()
  const hasChildren = Boolean(item.items?.length)
  const isChildActive = item.items?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
  const isDirectActive = item.href === "/" ? pathname === "/" : Boolean(item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
  const isActive = Boolean(isDirectActive || isChildActive)
  const [isOpen, setIsOpen] = useState(isActive)
  const setCollapsed = useSidebarStore((state) => state.setCollapsed)

  const Icon = item.icon
  const content = useMemo(
    () => (
      <>
        <Icon className="size-4 shrink-0" />
        {!isCollapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
            {hasChildren ? (
              <ChevronDown className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
            ) : null}
          </>
        ) : null}
      </>
    ),
    [Icon, hasChildren, isCollapsed, isOpen, item.title]
  )

  const itemClassName = cn(
    "h-10 w-full justify-start gap-3 rounded-lg px-3 text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-foreground",
    isCollapsed && "justify-center px-0",
    isActive &&
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
  )

  if (hasChildren) {
    const button = (
      <Button
        type="button"
        variant="ghost"
        className={itemClassName}
        aria-expanded={isCollapsed ? undefined : isOpen}
        aria-label={isCollapsed ? item.title : undefined}
        onClick={() => {
          if (isCollapsed) {
            setCollapsed(false)
            setIsOpen(true)
            return
          }

          setIsOpen((value) => !value)
        }}
      >
        {content}
      </Button>
    )

    return (
      <div className="space-y-1">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : (
          button
        )}

        {!isCollapsed && isOpen ? (
          <div className="ml-5 space-y-1 border-l border-sidebar-border pl-3">
            {item.items?.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`)

              return (
                <Button
                  key={child.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start rounded-lg px-3 text-sm text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-foreground",
                    childActive && "bg-sidebar-accent font-medium text-sidebar-foreground"
                  )}
                >
                  <Link href={child.href} onClick={onNavigate}>
                    {child.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  if (!item.href) return null

  const link = (
    <Button
      asChild
      variant="ghost"
      className={itemClassName}
      aria-label={isCollapsed ? item.title : undefined}
    >
      <Link href={item.href} onClick={onNavigate}>
        {content}
      </Link>
    </Button>
  )

  if (!isCollapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  )
}

export const SidebarItem = memo(SidebarItemComponent)
