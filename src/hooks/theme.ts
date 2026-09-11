import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themeApi } from '@/services/theme';
import { ThemeSettingsPayload } from '@/types/theme.types';
import { toast } from 'sonner';
import { applyThemeToDocument } from '@/components/providers/ThemeProvider';

export const useThemeSettingsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['theme-settings'],
    queryFn: () => themeApi.getAll(),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateThemeSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ThemeSettingsPayload) => themeApi.update(payload),
    onSuccess: (response, payload) => {
      if (response.status) {
        toast.success(response.message || 'Theme settings saved');
        applyThemeToDocument({
          ...(response.data || {}),
          ...payload,
        });
        queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to save theme settings'
      );
    },
  });
};
