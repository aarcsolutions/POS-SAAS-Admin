export type DashboardPeriod = '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';

export type DashboardDateRange = {
  from: string;
  to: string;
};

export interface DashboardLowStockItem {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  stock_label: string;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  order_count: number;
  units_sold: number;
  revenue: number;
  revenue_formatted: string;
  sales_label: string;
}

export interface DashboardSalesPoint {
  label: string;
  total: number;
}

export interface DashboardKpis {
  today_revenue: number;
  today_revenue_formatted: string;
  today_orders: number;
  period_revenue: number;
  period_revenue_formatted: string;
  period_orders: number;
  period_avg_order_value: number;
  period_avg_order_value_formatted: string;
  period_change_percent: number;
  active_orders_count: number;
  totals: {
    orders: number;
    customers: number;
    products: number;
  };
}

export interface DashboardLiveOrder {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  final_total: number;
  final_total_formatted: string;
  customer_name: string;
  branch_name: string | null;
  created_at: string;
}

export interface DashboardPaymentMixItem {
  method: string;
  count: number;
  amount: number;
  amount_formatted: string;
  percent: number;
}

export interface DashboardDayOfWeekSale {
  label: string;
  orders: number;
  revenue: number;
  revenue_formatted: string;
}

export interface DashboardCategorySale {
  id: string;
  category_name: string;
  order_count: number;
  revenue: number;
  revenue_formatted: string;
}

export interface DashboardRatingDistribution {
  rating: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface DashboardReviewsSummary {
  avg_rating: number;
  review_count: number;
  rating_distribution: DashboardRatingDistribution[];
}

export interface DashboardData {
  total_sales: number;
  total_sales_formatted: string;
  period_revenue: number;
  period_revenue_formatted: string;
  period_revenue_change_percent: number;
  active_branches: number;
  branches_subtitle: string;
  low_stock_count: number;
  low_stock_threshold: number;
  low_stock_items: DashboardLowStockItem[];
  kpis: DashboardKpis;
  live_orders: DashboardLiveOrder[];
  payment_mix: DashboardPaymentMixItem[];
  top_products: DashboardTopProduct[];
  sales_series: DashboardSalesPoint[];
  sales_by_day_of_week: DashboardDayOfWeekSale[];
  sales_by_category: DashboardCategorySale[];
  reviews_summary?: DashboardReviewsSummary;
  period: DashboardPeriod;
  totals: {
    orders: number;
    customers: number;
    products: number;
  };
}

export interface DashboardResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: DashboardData;
}

export type ReportsResponse = DashboardResponse;
