import api from '../lib/api';
import { ThemeSettingsPayload } from '@/types/theme.types';

export const themeApi = {
  getAll: async () => {
    const { data } = await api.get('/theme/getAll');
    return data;
  },
  update: async (payload: ThemeSettingsPayload) => {
    const { data } = await api.put('/theme/update', payload);
    return data;
  },
};
