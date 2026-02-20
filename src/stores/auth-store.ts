import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, User } from '@/types/user.ts'

interface AuthState {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void
  switchRole: (role: Role) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,

      login: (user) => set({ currentUser: user }),

      logout: () => set({ currentUser: null }),

      switchRole: (role) =>
        set((state) => {
          if (!state.currentUser) return state
          if (!state.currentUser.roles.includes(role)) return state
          return {
            currentUser: { ...state.currentUser, activeRole: role },
          }
        }),
    }),
    {
      name: 'ams-auth',
      version: 1,
    },
  ),
)
