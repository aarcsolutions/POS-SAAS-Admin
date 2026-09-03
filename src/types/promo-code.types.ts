export type PromoCodeType = 'percentage' | 'flat';

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  starts_at?: string | null;
  expires_at?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  is_active: boolean;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoCodesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: PromoCode[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PromoCodeDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: PromoCode;
}

export type PromoCodePayload = {
  code: string;
  type: PromoCodeType;
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  branch_id?: string | null;
  is_active?: boolean;
};
