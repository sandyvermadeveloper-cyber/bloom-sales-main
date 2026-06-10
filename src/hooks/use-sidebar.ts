"use client"

import { useSidebarStore } from "@/stores/sidebar-store"

export const useSidebar = () => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen)
  const setCollapsed = useSidebarStore((state) => state.setCollapsed)
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed)
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen)
  const closeMobile = useSidebarStore((state) => state.closeMobile)

  return {
    isCollapsed,
    isMobileOpen,
    setCollapsed,
    toggleCollapsed,
    setMobileOpen,
    closeMobile,
  }
}
