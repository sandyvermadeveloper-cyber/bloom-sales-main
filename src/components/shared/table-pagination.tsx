"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TablePaginationData = {
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type TablePaginationProps = {
  pagination?: TablePaginationData
  limit: number
  pageSizeOptions: readonly number[]
  isFetching: boolean
  onLimitChange: (value: number) => void
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function TablePagination({
  pagination,
  limit,
  pageSizeOptions,
  isFetching,
  onLimitChange,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: TablePaginationProps) {
  const visiblePages = getVisiblePages(pagination?.page ?? 1, pagination?.totalPages ?? 1)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
        <SelectTrigger className="h-10 w-full sm:w-[130px]">
          <SelectValue placeholder="Limit" />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((pageSize) => (
            <SelectItem key={pageSize} value={String(pageSize)}>
              {pageSize} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) ? (
        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={!pagination.hasPreviousPage || isFetching}
                className={!pagination.hasPreviousPage || isFetching ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  if (!pagination.hasPreviousPage || isFetching) return
                  onPreviousPage()
                }}
              />
            </PaginationItem>

            {visiblePages.map((page, index) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === pagination.page}
                    aria-disabled={isFetching}
                    className={isFetching ? "pointer-events-none opacity-50" : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      if (isFetching || page === pagination.page) return
                      onPageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={!pagination.hasNextPage || isFetching}
                className={!pagination.hasNextPage || isFetching ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  if (!pagination.hasNextPage || isFetching) return
                  onNextPage()
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages] as const
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages] as const
}
