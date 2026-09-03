export interface Review {
  id: string;
  branch_id?: string | null;
  branch_name?: string;
  order_id: string;
  order_number?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  rating: number;
  comment?: string | null;
  reviewed_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EligibleOrder {
  id: string;
  order_number: string;
  customer_name: string;
  final_total: number;
  branch_id?: string | null;
  created_at: string;
}

export interface ReviewsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Review[];
    reviews?: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReviewDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Review;
}

export type ReviewPayload = {
  branch_id?: string;
  order_id: string;
  rating: number;
  comment?: string | null;
  reviewed_at?: string;
};

export const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: `${n} star${n > 1 ? 's' : ''}`,
}));
