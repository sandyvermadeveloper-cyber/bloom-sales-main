"use client"

import { create } from "zustand"

type SidebarState = {
  isCollapsed: boolean
  isMobileOpen: boolean
  setCollapsed: (isCollapsed: boolean) => void
  toggleCollapsed: () => void
  setMobileOpen: (isMobileOpen: boolean) => void
  closeMobile: () => void
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  closeMobile: () => set({ isMobileOpen: false }),
}))
