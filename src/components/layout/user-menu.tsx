"use client"

import { LogOut, MonitorOff, User } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminProfile } from "@/types/auth"
import { formatDisplayName, formatEmail } from "@/utils/display-format"

type UserMenuProps = {
  employee: AdminProfile | null
  isLoggingOut?: boolean
  onLogout: () => void
  onLogoutAll: () => void
}

const getInitials = (employee: AdminProfile | null) => {
  if (!employee) return "A"

  if (employee.displayName) {
    return employee.displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "A"
}

export function UserMenu({ employee, isLoggingOut = false, onLogout, onLogoutAll }: UserMenuProps) {
  const initials = getInitials(employee)
  const displayName = formatDisplayName(employee?.displayName ?? employee?.firstName ?? "Admin")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Open user menu">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
          {employee?.email ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
              {formatEmail(employee.email)}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
        className=" font-semibold"
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault()
            onLogout()
          }}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault()
            onLogoutAll()
          }}
        >
          <MonitorOff className="size-4" />
          Logout all sessions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
