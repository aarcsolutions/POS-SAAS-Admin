import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '@/services/suppliers';
import {
  AssignRawMaterialPayload,
  AssignSupplierItemPayload,
  CreatePurchasePayload,
  MatchByItemsPayload,
  SupplierPayload,
} from '@/types/supplier.types';
import { toast } from 'sonner';

export const useSuppliersQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => suppliersApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Supplier created successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create supplier'
      );
    },
  });
};

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: SupplierPayload & { id: string }) =>
      suppliersApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Supplier updated successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update supplier'
      );
    },
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Supplier deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete supplier'
      );
    },
  });
};

export const useAssignedMaterialsQuery = (
  supplierId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['supplier-materials', supplierId],
    queryFn: () => suppliersApi.getAssignedRawMaterials(supplierId!),
    enabled: enabled && !!supplierId,
  });
};

export const useAssignRawMaterialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRawMaterialPayload) =>
      suppliersApi.assignRawMaterial(payload),
    onSuccess: (response, vars) => {
      if (response.status) {
        toast.success(response.message || 'Material assigned');
        queryClient.invalidateQueries({
          queryKey: ['supplier-materials', vars.supplier_id],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to assign material'
      );
    },
  });
};

export const useUnassignRawMaterialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      supplierId,
    }: {
      id: string;
      supplierId: string;
    }) => suppliersApi.unassignRawMaterial(id),
    onSuccess: (response, vars) => {
      if (response.status) {
        toast.success(response.message || 'Material unassigned');
        queryClient.invalidateQueries({
          queryKey: ['supplier-materials', vars.supplierId],
        });
        queryClient.invalidateQueries({
          queryKey: ['supplier-assigned-items', vars.supplierId],
        });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to unassign material'
      );
    },
  });
};

export const useMatchByMaterialsMutation = () => {
  return useMutation({
    mutationFn: (raw_material_ids: string[]) =>
      suppliersApi.matchByMaterials(raw_material_ids),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to match suppliers'
      );
    },
  });
};

export const useAssignedItemsQuery = (
  supplierId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['supplier-assigned-items', supplierId],
    queryFn: () => suppliersApi.getAssignedItems(supplierId!),
    enabled: enabled && !!supplierId,
  });
};

export const useAssignItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignSupplierItemPayload) =>
      suppliersApi.assignItem(payload),
    onSuccess: (response, vars) => {
      if (response.status) {
        toast.success(response.message || 'Item assigned');
        queryClient.invalidateQueries({
          queryKey: ['supplier-assigned-items', vars.supplier_id],
        });
        queryClient.invalidateQueries({
          queryKey: ['supplier-materials', vars.supplier_id],
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign item');
    },
  });
};

export const useMatchByItemsMutation = () => {
  return useMutation({
    mutationFn: (payload: MatchByItemsPayload) =>
      suppliersApi.matchByItems(payload),
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to match suppliers'
      );
    },
  });
};

export const usePurchasesQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
  } = {},
  enabled = true
) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => suppliersApi.getAllPurchases(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

export const usePurchaseQuery = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => suppliersApi.getPurchaseById(id!),
    enabled: enabled && !!id,
  });
};

export const useCreatePurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchasePayload) =>
      suppliersApi.createPurchase(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Purchase order created (draft)');
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create purchase order'
      );
    },
  });
};

export const useMarkOrderedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.markOrdered(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Marked as ordered');
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
        queryClient.invalidateQueries({ queryKey: ['purchase'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark ordered');
    },
  });
};

export const useReceivePurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items?: Array<{
        id: string;
        received_quantity: number;
        price?: number;
      }>;
    }) => suppliersApi.receivePurchase(id, items),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Goods received — stock updated');
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
        queryClient.invalidateQueries({ queryKey: ['purchase'] });
        queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to receive purchase'
      );
    },
  });
};

export const useCancelPurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.cancelPurchase(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Purchase cancelled');
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
        queryClient.invalidateQueries({ queryKey: ['purchase'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to cancel purchase'
      );
    },
  });
};

export const useSendPurchaseEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.sendPurchaseEmail(id),
    onSuccess: (response) => {
      toast.message(
        response.message ||
          'Email service is not configured yet. PO is ready to send when connected.'
      );
      queryClient.invalidateQueries({ queryKey: ['purchase'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to queue purchase email'
      );
    },
  });
};
