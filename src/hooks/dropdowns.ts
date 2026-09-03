import { useQuery } from '@tanstack/react-query';
import { dropdownsApi } from '@/services/dropdowns';
import { useAuthStore } from '@/store/authStore';

export const useGendersQuery = () => {
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: ['dropdowns', 'genders', tenantId],
    queryFn: () => dropdownsApi.getAllGenders(),
    enabled: isHydrated && Boolean(tenantId),
    staleTime: 5 * 60 * 1000,
  });
};
