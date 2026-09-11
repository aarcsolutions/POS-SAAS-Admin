import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantBillingApi } from '@/services/tenant-billing';
import { toast } from 'sonner';

export const useTenantInvoicesQuery = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['tenant-billing', 'invoices', params],
    queryFn: () => tenantBillingApi.myInvoices(params),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useTenantPaymentsQuery = (
  params: { page?: number; limit?: number; status?: string } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['tenant-billing', 'payments', params],
    queryFn: () => tenantBillingApi.myPayments(params),
    enabled,
  });
};

export const useOpenInvoicesSummaryQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['tenant-billing', 'open-summary'],
    queryFn: () => tenantBillingApi.openSummary(),
    enabled,
    refetchInterval: enabled ? 60_000 : false,
  });
};

export const useSubmitTenantPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantBillingApi.submitPayment,
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Payment proof submitted');
        queryClient.invalidateQueries({ queryKey: ['tenant-billing'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to submit payment'
      );
    },
  });
};
