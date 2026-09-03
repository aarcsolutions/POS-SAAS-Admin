import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promoCodesApi } from '@/services/promo-codes';
import { PromoCodePayload } from '@/types/promo-code.types';
import { toast } from 'sonner';

export const usePromoCodesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {}
) =>
  useQuery({
    queryKey: ['promo-codes', params],
    queryFn: () => promoCodesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });

export const useCreatePromoCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromoCodePayload) => promoCodesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Coupon created');
        queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create coupon');
    },
  });
};

export const useUpdatePromoCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: Partial<PromoCodePayload> & { id: string }) =>
      promoCodesApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Coupon updated');
        queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update coupon');
    },
  });
};

export const useDeletePromoCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promoCodesApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Coupon deleted');
        queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete coupon');
    },
  });
};

export const useTogglePromoCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      promoCodesApi.update(id, { is_active }),
    onSuccess: (response) => {
      if (response.status) {
        queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });
};
