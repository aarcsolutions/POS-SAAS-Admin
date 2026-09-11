export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'cancelled'
  | 'no_show'
  | 'completed';

export interface Reservation {
  id: string;
  branch_id?: string | null;
  branch_name?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  guest_name: string;
  guest_phone?: string | null;
  restaurant_table_id?: string | null;
  table_name?: string | null;
  party_size: number;
  reserved_at: string;
  duration_minutes: number;
  status: ReservationStatus;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantTableOption {
  id: string;
  name: string;
  code?: string | null;
  capacity?: number | null;
  status: string;
  branch_id?: string | null;
}

export interface ReservationsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Reservation[];
    reservations?: Reservation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReservationDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Reservation;
}

export type ReservationPayload = {
  branch_id?: string;
  customer_id?: string | null;
  guest_name: string;
  guest_phone?: string | null;
  restaurant_table_id?: string | null;
  party_size: number;
  reserved_at: string;
  duration_minutes?: number;
  status?: ReservationStatus;
  notes?: string | null;
};

export const RESERVATION_STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
}[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'seated', label: 'Seated' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
  { value: 'completed', label: 'Completed' },
];

export const STATUS_BADGE: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  },
  seated: {
    label: 'Seated',
    className: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600',
  },
  no_show: {
    label: 'No show',
    className: 'bg-rose-100 text-rose-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-[var(--brand-icon-soft)] text-[var(--brand-icon)]',
  },
};
