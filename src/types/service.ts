export type Service = {
  id: string
  label?: string
  name?: string
  slug?: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type ServiceInput = {
  name: string
  description?: string
}

export type ListServicesQuery = {
  page: number
  limit: number
  search?: string
}

export type ServicesPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListServicesData = {
  services: Service[]
  pagination: ServicesPagination
}

export type ServiceData = Service
