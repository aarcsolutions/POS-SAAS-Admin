import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/users';
import { toast } from 'sonner';

export const useUsersQuery = (
  params: { page?: number; limit?: number; search?: string } = {}
) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      roleId: string;
    }) => usersApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'User created successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      email?: string;
      password?: string;
      roleId?: string;
    }) => usersApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'User updated successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'User deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    },
  });
};
