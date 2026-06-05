import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, ModulePermission } from '@/types/auth.types';



interface AuthState {
  user: User | null;
  permissions: string[];
  modulesWithPermisssions: ModulePermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // Added for persistence check

  logout: () => void;
  setAuth: (user: User, modules: ModulePermission[]) => void;
  hasPermission: (permissionSlug: string) => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      modulesWithPermisssions: [],
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,


      logout: () => {
        set({ user: null, permissions: [], modulesWithPermisssions: [], isAuthenticated: false });
        localStorage.removeItem('auth-storage'); 
      },

      setAuth: (user: User, modules: ModulePermission[]) => {
        const flatPermissions = modules.flatMap(m => 
          m.permissions.filter(p => p.is_allowed).map(p => `${m.module_slug}/${p.permission_slug}`)
        );
        set({ user, modulesWithPermisssions: modules, permissions: flatPermissions, isAuthenticated: true });
      },

      hasPermission: (permissionPath: string) => {
        return get().permissions.includes(permissionPath);
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (!error && state) {
            state.setHydrated();
          }
        };
      },
    }
  )
);
