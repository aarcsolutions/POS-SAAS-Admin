export type CateringEventStatus =
  | 'inquiry'
  | 'quoted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type CateringVenueType = 'on_premise' | 'off_premise';

export interface CateringEvent {
  id: string;
  branch_id?: string | null;
  branch_name?: string;
  customer_id?: string | null;
  customer_name?: string | null;
  contact_name: string;
  contact_phone?: string | null;
  event_name?: string | null;
  event_at: string;
  party_size: number;
  venue_type: CateringVenueType;
  venue_address?: string | null;
  status: CateringEventStatus;
  estimated_total?: number | null;
  notes?: string | null;
  order_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CateringEventsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: CateringEvent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CateringEventDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: CateringEvent;
}

export type CateringEventPayload = {
  branch_id?: string;
  customer_id?: string | null;
  contact_name: string;
  contact_phone?: string | null;
  event_name?: string | null;
  event_at: string;
  party_size: number;
  venue_type?: CateringVenueType;
  venue_address?: string | null;
  status?: CateringEventStatus;
  estimated_total?: number | null;
  notes?: string | null;
};

export const CATERING_STATUS_OPTIONS: {
  value: CateringEventStatus;
  label: string;
}[] = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const VENUE_TYPE_OPTIONS: {
  value: CateringVenueType;
  label: string;
}[] = [
  { value: 'on_premise', label: 'On premise' },
  { value: 'off_premise', label: 'Off premise' },
];

export const STATUS_BADGE: Record<
  CateringEventStatus,
  { label: string; className: string }
> = {
  inquiry: {
    label: 'Inquiry',
    className: 'bg-slate-100 text-slate-700',
  },
  quoted: {
    label: 'Quoted',
    className: 'bg-amber-100 text-amber-800',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-sky-100 text-sky-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-700',
  },
};
