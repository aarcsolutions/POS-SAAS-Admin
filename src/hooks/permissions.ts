import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  permissionsApi,
  PermissionPayload,
  PermissionsQueryParams,
} from '@/services/permissions';
import { toast } from 'sonner';

export const usePermissionsQuery = (params: PermissionsQueryParams = {}) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PermissionPayload) => permissionsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Permission created successfully');
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create permission'
      );
    },
  });
};

export const useUpdatePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: PermissionPayload & { id: string }) =>
      permissionsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Permission updated successfully');
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update permission'
      );
    },
  });
};

export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Permission deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete permission'
      );
    },
  });
};
