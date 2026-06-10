"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebar } from "@/hooks/use-sidebar"

export function MobileSidebar() {
  const { isMobileOpen, setMobileOpen, closeMobile } = useSidebar()

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-[280px] max-w-[85vw] p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">Browse admin dashboard sections.</SheetDescription>
        <AppSidebar onNavigate={closeMobile} />
      </SheetContent>
    </Sheet>
  )
}
