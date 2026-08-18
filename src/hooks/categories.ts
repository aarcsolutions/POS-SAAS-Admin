import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, CategoryPayload } from '@/services/categories';
import { toast } from 'sonner';

export const useCategoriesQuery = (
  params: { page?: number; limit?: number; search?: string } = {}
) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCategoriesByParentQuery = (
  parentId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['categories', 'byParent', parentId ?? 'root'],
    queryFn: () => categoriesApi.getByParentId(parentId),
    enabled,
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoriesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Category created successfully');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create category'
      );
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
    } & Partial<CategoryPayload>) => categoriesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Category updated successfully');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update category'
      );
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Category deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete category'
      );
    },
  });
};
