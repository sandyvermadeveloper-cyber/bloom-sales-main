"use client"

import { create } from "zustand"

import { adminAuthApi } from "@/api/auth.api"
import type { AdminLoginChallenge, AdminProfile } from "@/types/auth"

type AuthState = {
  employee: AdminProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  loginChallenge: AdminLoginChallenge | null
  setEmployee: (employee: AdminProfile) => void
  clearSession: () => void
  setLoading: (isLoading: boolean) => void
  setLoginChallenge: (challenge: AdminLoginChallenge | null) => void
  restoreSession: () => Promise<AdminProfile | null>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
}

let restoreRequest: Promise<AdminProfile | null> | null = null

export const useAuthStore = create<AuthState>()((set) => ({
  employee: null,
  isAuthenticated: false,
  isLoading: false,
  loginChallenge: null,
  setEmployee: (employee) => {
    set((state) => {
      if (state.employee?.id === employee.id && state.isAuthenticated && !state.isLoading) {
        return state
      }

      return {
        employee,
        isAuthenticated: true,
        isLoading: false,
      }
    })
  },
  clearSession: () => {
    set({
      employee: null,
      isAuthenticated: false,
      isLoading: false,
      loginChallenge: null,
    })
  },
  setLoading: (isLoading) => {
    set((state) => (state.isLoading === isLoading ? state : { isLoading }))
  },
  setLoginChallenge: (loginChallenge) => set({ loginChallenge }),
  restoreSession: async () => {
    set((state) => (state.isLoading ? state : { isLoading: true }))

    restoreRequest ??= adminAuthApi
      .me()
      .then((response) => {
        const employee = response.data.employee
        set({
          employee,
          isAuthenticated: true,
          isLoading: false,
        })
        return employee
      })
      .catch(() => {
        set({
          employee: null,
          isAuthenticated: false,
          isLoading: false,
          loginChallenge: null,
        })
        return null
      })
      .finally(() => {
        restoreRequest = null
      })

    return restoreRequest
  },
  logout: async () => {
    try {
      await adminAuthApi.logout()
    } finally {
      set({
        employee: null,
        isAuthenticated: false,
        isLoading: false,
        loginChallenge: null,
      })
    }
  },
  logoutAll: async () => {
    try {
      await adminAuthApi.logoutAll()
    } finally {
      set({
        employee: null,
        isAuthenticated: false,
        isLoading: false,
        loginChallenge: null,
      })
    }
  },
}))
