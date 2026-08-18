import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi, ModulePayload, ModulesQueryParams } from '@/services/modules';
import { toast } from 'sonner';

export const useModulesQuery = (params: ModulesQueryParams = {}) => {
  return useQuery({
    queryKey: ['modules', params],
    queryFn: () => modulesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ModulePayload) => modulesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Module created successfully');
        queryClient.invalidateQueries({ queryKey: ['modules'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create module');
    },
  });
};

export const useUpdateModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: ModulePayload & { id: string }) =>
      modulesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Module updated successfully');
        queryClient.invalidateQueries({ queryKey: ['modules'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update module');
    },
  });
};

export const useDeleteModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modulesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Module deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['modules'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete module');
    },
  });
};
