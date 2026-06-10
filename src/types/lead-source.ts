export type LeadSource = {
  id: string
  label?: string
  name?: string
  slug?: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export type LeadSourceInput = {
  name: string
  description?: string
}

export type ListLeadSourcesQuery = {
  page: number
  limit: number
  search?: string
}

export type LeadSourcesPagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ListLeadSourcesData = {
  leadSources: LeadSource[]
  pagination: LeadSourcesPagination
}

export type LeadSourceData = LeadSource
