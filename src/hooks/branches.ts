import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi } from '@/services/branches';
import type { BranchCreateBootstrapPayload } from '@/types/branch.types';

export const useBranchesQuery = (
  params: { page?: number; limit?: number; search?: string } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchesApi.getAll(params),
    placeholderData: (prev) => prev,
    enabled,
  });

export const useBranchLicenseQuery = () =>
  useQuery({
    queryKey: ['branches', 'license'],
    queryFn: () => branchesApi.getLicenseInfo(),
  });

export const useBranchLicensedCatalogQuery = (enabled = true) =>
  useQuery({
    queryKey: ['branches', 'licensed-catalog'],
    queryFn: () => branchesApi.getLicensedCatalog(),
    enabled,
  });

export const useBranchByIdQuery = (id: string | null) =>
  useQuery({
    queryKey: ['branches', 'detail', id],
    queryFn: () => branchesApi.getById(id!),
    enabled: !!id,
  });

export const useCreateBranchMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: BranchCreateBootstrapPayload & {
        moduleIds?: string[];
        permissionIds: string[];
      }
    ) =>
      branchesApi.create({
        ...payload,
        moduleIds: payload.moduleIds || payload.enabledModuleIds,
        permissionIds: payload.permissionIds,
      }),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch created');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          'You are not allowed to create more branches'
      );
    },
  });
};

export const useUpdateBranchMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: BranchCreateBootstrapPayload & {
      id: string;
      moduleIds?: string[];
    }) =>
      branchesApi.update(id, {
        ...payload,
        moduleIds: payload.moduleIds || payload.enabledModuleIds,
      }),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch updated');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update branch');
    },
  });
};

export const useDeleteBranchMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.delete(id),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch deleted');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete branch');
    },
  });
};

export const useRequestBranchesMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { requestedCount: number; message?: string }) =>
      branchesApi.requestBranches(payload),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch request sent');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    },
  });
};
