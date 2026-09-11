import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessSettingsApi } from '@/services/business-settings';
import { BusinessSettingsPayload } from '@/types/business-settings.types';
import { toast } from 'sonner';

export const useBusinessSettingsQuery = (
  params: { page?: number; limit?: number; branch_id?: string } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['business-settings', params],
    queryFn: () => businessSettingsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useSaveBusinessSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BusinessSettingsPayload) =>
      payload.id
        ? businessSettingsApi.update(payload)
        : businessSettingsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Settings saved');
        queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to save settings'
      );
    },
  });
};
