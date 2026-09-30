import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi } from '@/services/branches';
import type { BranchCreateBootstrapPayload } from '@/types/branch.types';
import { useAuthStore } from '@/store/authStore';
import { extractListItems } from '@/utils/helpers';

export type BranchOption = { value: string; label: string };

export const useBranchesQuery = (
  params: { page?: number; limit?: number; search?: string } = {},
  options:
    | boolean
    | { enabled?: boolean; refetchInterval?: number | false | ((query: any) => number | false) } = true
) => {
  const opts =
    typeof options === 'boolean' ? { enabled: options } : options || {};
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchesApi.getAll(params),
    placeholderData: (prev) => prev,
    enabled: opts.enabled !== false,
    refetchInterval: opts.refetchInterval ?? false,
  });
};

/**
 * Tenant-admin branch scope for list filters / form selects.
 * Hide branch UI until the tenant has at least one branch.
 */
export function useTenantBranchScope(enabled = true) {
  const user = useAuthStore((s) => s.user);
  const isTenantAdmin = !user?.branchId;
  const queryEnabled = enabled && isTenantAdmin;

  const query = useBranchesQuery({ page: 1, limit: 100 }, queryEnabled);

  const branches = useMemo(() => {
    const fromKey = extractListItems<{ id: string; name: string; code?: string }>(
      query.data,
      'branches'
    );
    if (fromKey.length) return fromKey;
    return extractListItems<{ id: string; name: string; code?: string }>(
      query.data
    );
  }, [query.data]);

  const branchOptions: BranchOption[] = useMemo(
    () =>
      branches.map((b) => ({
        value: b.id,
        label: b.name || b.code || b.id,
      })),
    [branches]
  );

  const hasBranches = branchOptions.length > 0;
  /** Show branch filter / column / form select only when branches exist */
  const showBranchFilter = isTenantAdmin && hasBranches;

  return {
    isTenantAdmin,
    hasBranches,
    showBranchFilter,
    branchOptions,
    branches,
    branchesQuery: query,
  };
}
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
    onSuccess: (res: any, id: string) => {
      if (!res?.status) return;

      toast.success(
        res.message ||
          'Permanent deletion started. You can keep working — we will update the list when it finishes.'
      );

      // Optimistic: mark row as deleting without waiting for the job
      qc.setQueriesData({ queryKey: ['branches'] }, (old: any) => {
        if (!old) return old;
        const patchRow = (row: any) =>
          row?.id === id
            ? {
                ...row,
                purge_job_id: res?.data?.jobId || row.purge_job_id || 'pending',
              }
            : row;

        if (Array.isArray(old?.data?.data)) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map(patchRow),
            },
          };
        }
        if (Array.isArray(old?.data?.branches)) {
          return {
            ...old,
            data: {
              ...old.data,
              branches: old.data.branches.map(patchRow),
            },
          };
        }
        if (Array.isArray(old?.data)) {
          return { ...old, data: old.data.map(patchRow) };
        }
        return old;
      });

      qc.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err: any) => {
      const data = err?.response?.data?.data;
      const reasons = data?.reasons as
        | Array<{ message?: string }>
        | undefined;
      const msg =
        reasons?.[0]?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message[0]
          : err?.response?.data?.message) ||
        'Failed to permanently delete branch';
      toast.error(msg);
    },
  });
};

export const useDeactivateBranchMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.deactivate(id),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch deactivated');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || 'Failed to deactivate branch'
      );
    },
  });
};

export const useActivateBranchMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.activate(id),
    onSuccess: (res: any) => {
      if (res?.status) {
        toast.success(res.message || 'Branch activated');
        qc.invalidateQueries({ queryKey: ['branches'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to activate branch');
    },
  });
};

export const useBranchHistoryQuery = (
  params: { page?: number; limit?: number } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['branches', 'history', params],
    queryFn: () => branchesApi.listHistory(params),
    enabled,
  });

export const useBranchHistoryReportQuery = (id: string | null) =>
  useQuery({
    queryKey: ['branches', 'history-report', id],
    queryFn: () => branchesApi.getHistoryReport(id!),
    enabled: !!id,
  });

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
