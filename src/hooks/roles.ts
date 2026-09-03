import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/services/roles';
import { ModuleWithPermissions } from '@/types/rbac.types';
import { toast } from 'sonner';

export const useRolesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title: string }) => rolesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Role created successfully');
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      rolesApi.update(id, { title }),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Role updated successfully');
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    },
  });
};

export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Role deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    },
  });
};

export const useRolePermissionsQuery = (roleId: string | null) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => rolesApi.getPermissions(roleId!),
    enabled: !!roleId,
  });
};

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      modules,
    }: {
      roleId: string;
      modules: ModuleWithPermissions[];
    }) => rolesApi.updatePermissions(roleId, modules),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Permissions updated successfully');
        queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update permissions'
      );
    },
  });
};
