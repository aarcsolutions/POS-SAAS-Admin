import { useAuthStore } from '@/store/authStore';

/**
 * A simple hook to check for a single permission slug.
 * Usage: const canCreate = usePermission('users/create');
 */
export const usePermission = (permissionSlug: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions.includes(permissionSlug);
};
