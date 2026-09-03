import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/services/reservations';
import { ReservationPayload } from '@/types/reservation.types';
import { toast } from 'sonner';

export const useReservationsQuery = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    branch_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useReservationByIdQuery = (
  id: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => reservationsApi.getById(id!),
    enabled: Boolean(id) && enabled,
  });
};

export const useReservationTablesQuery = (branchId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['reservation-tables', branchId],
    queryFn: () => reservationsApi.getAllTables(branchId),
    enabled,
  });
};

export const useCreateReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReservationPayload) =>
      reservationsApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Reservation created successfully');
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create reservation'
      );
    },
  });
};

export const useUpdateReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: ReservationPayload & { id: string }) =>
      reservationsApi.update(id, payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Reservation updated successfully');
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update reservation'
      );
    },
  });
};

export const useDeleteReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsApi.delete(id),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Reservation deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete reservation'
      );
    },
  });
};
