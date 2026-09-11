import api from '../lib/api';
import { WebsiteSettingsPayload } from '@/types/website.types';

export const websiteApi = {
  getAll: async () => {
    const { data } = await api.get('/website/getAll');
    return data;
  },
  update: async (payload: WebsiteSettingsPayload) => {
    const { data } = await api.put('/website/update', payload);
    return data;
  },
};
