export type PaymentTab = 'all' | 'collected' | 'pending_cod';

export type PaymentSource = 'payment' | 'pending_cod';

export interface PaymentListItem {
  id: string;
  source: PaymentSource;
  order_id: string;
  order_number: string | null;
  customer_name: string | null;
  method: string;
  amount: number;
  status: string;
  transaction_no: string | null;
  created_at: string;
  branch_id: string | null;
  branch_name: string | null;
}

export interface PaymentDetail extends PaymentListItem {
  customer_phone?: string | null;
  updated_at?: string;
  order?: {
    id: string;
    order_number: string | null;
    status: string;
    order_type: string;
    final_total: number;
    payment_method: string | null;
  } | null;
}

export interface PaymentsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: PaymentListItem[];
    payments?: PaymentListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: PaymentDetail;
}
