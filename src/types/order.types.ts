export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

/** Collected payment methods on Payment rows. */
export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'other';

/** Order-level payment intent (COD is not a Payment until collected). */
export type OrderPaymentMethod = 'cod' | 'cash' | 'card';

export interface OrderCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  product?: { id: string; title?: string; name?: string } | null;
  variant?: { id: string; name: string } | null;
}

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: string;
  transaction_no?: string | null;
  created_at?: string;
}

export interface OrderDriver {
  id: string;
  name: string;
  phone: string;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  order_type: OrderType;
  branch_id?: string | null;
  branch_name?: string | null;
  is_archived?: boolean;
  table_name?: string | null;
  table_id?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_phone?: string | null;
  delivery_fee?: number;
  status: OrderStatus;
  customer: OrderCustomer | null;
  subtotal: number;
  discount: number;
  tax_amount: number;
  final_total: number;
  payment_status: 'paid' | 'unpaid';
  payment_method?: OrderPaymentMethod | PaymentMethod | null;
  driver_id?: string | null;
  tracking_token?: string | null;
  driver?: OrderDriver | null;
  created_at: string;
  has_review?: boolean;
}

export interface OrderDetail extends OrderListItem {
  customer_id: string;
  promo_code?: string | null;
  tax_id?: string | null;
  inventory_deducted?: boolean;
  items: OrderItem[];
  order_taxes?: Array<{
    id: string;
    tax_name: string;
    tax_type: string;
    tax_value: number;
    tax_amount: number;
  }>;
  order_promos?: Array<{
    id: string;
    code: string;
    discount: number;
  }>;
  payments?: OrderPayment[];
  updated_at?: string;
}

export interface OrdersListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data: OrderListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface OrderDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: OrderDetail;
}

export interface CreateOrderPayload {
  customer_id: string;
  order_type: OrderType;
  table_id?: string;
  table_name?: string;
  reservation_id?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_phone?: string;
  delivery_fee?: number;
  payment_method?: OrderPaymentMethod;
  items: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
  }>;
  promo_code?: string;
  tax_id?: string;
}

export interface CartLine {
  key: string;
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
}
