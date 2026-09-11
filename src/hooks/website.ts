import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websiteApi } from '@/services/website';
import { WebsiteSettingsPayload } from '@/types/website.types';
import { toast } from 'sonner';

export const useWebsiteSettingsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['website-settings'],
    queryFn: () => websiteApi.getAll(),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateWebsiteSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WebsiteSettingsPayload) => websiteApi.update(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Website settings saved');
        queryClient.invalidateQueries({ queryKey: ['website-settings'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to save website settings'
      );
    },
  });
};
