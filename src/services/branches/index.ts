import api from '../lib/api';
import type {
  Branch,
  BranchCreateBootstrapPayload,
  BranchRequestDraft,
} from '@/types/branch.types';

export const branchesApi = {
  getAll: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { data } = await api.get('/branches/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/branches/getById/${id}`);
    return data;
  },

  getLicenseInfo: async () => {
    const { data } = await api.get('/branches/getLicenseInfo');
    return data;
  },

  getLicensedCatalog: async () => {
    const { data } = await api.get('/branches/getLicensedCatalog');
    return data;
  },

  create: async (payload: BranchCreateBootstrapPayload & { moduleIds: string[]; permissionIds: string[] }) => {
    const { data } = await api.post('/branches/create', {
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      is_active: payload.status !== 'inactive',
      moduleIds: payload.moduleIds || payload.enabledModuleIds,
      roleTitle: payload.roleTitle,
      permissionIds: payload.permissionIds,
      adminName: payload.adminName,
      adminEmail: payload.adminEmail,
      adminPassword: payload.adminPassword,
    });
    return data;
  },

  update: async (
    id: string,
    payload: Partial<Branch> & {
      moduleIds?: string[];
      permissionIds?: string[];
      roleTitle?: string;
      adminName?: string;
      adminEmail?: string;
      adminPassword?: string;
    }
  ) => {
    const { data } = await api.put('/branches/update', {
      id,
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      is_active: payload.status !== 'inactive',
      moduleIds: payload.moduleIds || payload.enabledModuleIds,
      permissionIds: payload.permissionIds,
      roleTitle: payload.roleTitle,
      adminName: payload.adminName,
      adminEmail: payload.adminEmail,
      adminPassword: payload.adminPassword || undefined,
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/branches/delete', { data: { id } });
    return data;
  },

  deactivate: async (id: string) => {
    const { data } = await api.put('/branches/update', {
      id,
      is_active: false,
    });
    return data;
  },

  activate: async (id: string) => {
    const { data } = await api.put('/branches/update', {
      id,
      is_active: true,
    });
    return data;
  },

  purgeCheck: async (id: string) => {
    const { data } = await api.get('/branches/purgeCheck', { params: { id } });
    return data;
  },

  listHistory: async (params: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get('/branches/history', { params });
    return data;
  },

  getHistory: async (id: string) => {
    const { data } = await api.get(`/branches/history/${id}`);
    return data;
  },

  getHistoryReport: async (id: string) => {
    const { data } = await api.get(`/branches/history/${id}/report`);
    return data;
  },

  requestBranches: async (payload: { requestedCount: number; message?: string }) => {
    const { data } = await api.post('/branches/requestBranches', payload);
    return data;
  },
};

export type { Branch, BranchRequestDraft };
