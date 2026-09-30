import api from '../lib/api';
import { NotificationSettingsPayload } from '@/types/notification-settings.types';

export const notificationsApi = {
  getAll: async () => {
    const { data } = await api.get('/notifications/getAll');
    return data;
  },

  update: async (payload: NotificationSettingsPayload) => {
    const { data } = await api.put('/notifications/update', payload);
    return data;
  },
};
