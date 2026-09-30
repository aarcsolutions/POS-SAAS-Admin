import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/notifications';
import { NotificationSettingsPayload } from '@/types/notification-settings.types';
import { toast } from 'sonner';

export const useNotificationSettingsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => notificationsApi.getAll(),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useSaveNotificationSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationSettingsPayload) =>
      notificationsApi.update(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Notification settings saved');
        queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to save notification settings'
      );
    },
  });
};
