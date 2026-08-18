import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ProductsQueryParams } from '@/services/products';
import { ProductPayload } from '@/types/product.types';
import { toast } from 'sonner';

export const useProductsQuery = (
  params: ProductsQueryParams = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useProductQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Product created successfully');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create product'
      );
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<ProductPayload>) =>
      productsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Product updated successfully');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update product'
      );
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Product deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete product'
      );
    },
  });
};
