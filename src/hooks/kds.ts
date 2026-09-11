import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kdsApi, KdsMarkReadyAction } from '@/services/kds';
import { useOrderSocketConnected } from '@/components/realtime/OrderSocketProvider';
import { toast } from 'sonner';

export const useKdsQueueQuery = () => {
  const socketConnected = useOrderSocketConnected();

  return useQuery({
    queryKey: ['kds'],
    queryFn: () => kdsApi.getAll(),
    refetchInterval: socketConnected ? 60000 : 8000,
    placeholderData: (previousData) => previousData,
  });
};

export const useKdsMarkReadyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; action?: KdsMarkReadyAction }) =>
      kdsApi.markReady(payload),
    onSuccess: (response, variables) => {
      if (response.status) {
        toast.success(
          response.message ||
            (variables.action === 'start'
              ? 'Cooking started'
              : 'Order marked ready')
        );
        queryClient.invalidateQueries({ queryKey: ['kds'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update kitchen status'
      );
    },
  });
};
