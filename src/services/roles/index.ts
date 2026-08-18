import api from '../lib/api';
import {
  RolesListResponse,
  RoleDetailResponse,
  RolePermissionsResponse,
  ModuleWithPermissions,
} from '@/types/rbac.types';

export const rolesApi = {
  getAll: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { data } = await api.get<RolesListResponse>('/roles/getAll', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<RoleDetailResponse>(`/roles/getById/${id}`);
    return data;
  },

  create: async (payload: { title: string }) => {
    const { data } = await api.post('/roles/create', payload);
    return data;
  },

  update: async (id: string, payload: { title: string }) => {
    const { data } = await api.put('/roles/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/roles/delete', { data: { id } });
    return data;
  },

  getPermissions: async (roleId: string) => {
    const { data } = await api.get<RolePermissionsResponse>(
      `/roles/getAllPermissionsByRoleId/${roleId}`
    );
    return data;
  },

  updatePermissions: async (
    roleId: string,
    modulesWithPermissions: ModuleWithPermissions[]
  ) => {
    const { data } = await api.put('/roles/updatePermissionsAccessByRoleId', {
      roleId,
      modulesWithPermissions: modulesWithPermissions.map((module) => ({
        moduleSlug: module.slug,
        permissions: module.permissions.map((permission) => ({
          id: permission.id,
          permissionSlug: permission.slug,
          isAllowed: permission.is_allowed,
        })),
      })),
    });
    return data;
  },
};
