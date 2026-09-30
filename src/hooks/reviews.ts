import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/services/reviews';
import { ReviewPayload } from '@/types/review.types';
import { toast } from 'sonner';

export const useReviewsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    rating?: number;
    date_from?: string;
    date_to?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useReviewByIdQuery = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getById(id!),
    enabled: Boolean(id) && enabled,
  });
};

export const useEligibleOrdersQuery = (
  branchId?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['review-eligible-orders', branchId],
    queryFn: () => reviewsApi.getEligibleOrders(branchId),
    enabled,
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewPayload) => reviewsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Review created successfully');
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['review-eligible-orders'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create review');
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: ReviewPayload & { id: string }) => reviewsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Review updated successfully');
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update review');
    },
  });
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Review deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['review-eligible-orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete review');
    },
  });
};
