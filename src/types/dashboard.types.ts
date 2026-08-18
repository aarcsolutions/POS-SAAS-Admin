export type DashboardPeriod = '30d' | 'month' | 'year';

export interface DashboardLowStockItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock_quantity: number;
  stock_label: string;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  order_count: number;
  revenue: number;
  revenue_formatted: string;
  sales_label: string;
}

export interface DashboardSalesPoint {
  label: string;
  total: number;
}

export interface DashboardData {
  total_sales: number;
  total_sales_formatted: string;
  total_sales_change_percent: number;
  monthly_revenue: number;
  monthly_revenue_formatted: string;
  monthly_change_percent: number;
  active_branches: number;
  branches_subtitle: string;
  low_stock_count: number;
  low_stock_threshold: number;
  low_stock_items: DashboardLowStockItem[];
  top_products: DashboardTopProduct[];
  sales_series: DashboardSalesPoint[];
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
