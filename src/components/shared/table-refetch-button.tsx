"use client"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TableRefetchButtonProps = {
  isFetching: boolean
  onRefetch: () => void
  label?: string
  className?: string
}

export function TableRefetchButton({
  isFetching,
  onRefetch,
  label = "Refetch",
  className,
}: TableRefetchButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-2 h-10", className)}
      disabled={isFetching}
      onClick={onRefetch}
    >
      <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
      {isFetching ? "Refreshing" : label}
    </Button>
  )
}
