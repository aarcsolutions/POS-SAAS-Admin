export interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

export type ProductInventoryTracking = 'recipe' | 'direct_stock';

export interface ProductVariant {
  id?: string;
  name: string;
  price: number;
  cost_price: number;
  stock_quantity?: number;
  min_stock_level?: number;
  opening_stock?: number;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category?: { id: string; name: string } | null;
  description?: string | null;
  has_variant: boolean;
  inventory_tracking?: ProductInventoryTracking | string;
  is_active: boolean;
  branch_id?: string | null;
  branch_name?: string | null;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Product[];
    products?: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProductDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Product;
}

export interface ProductPayload {
  name: string;
  category_id: string;
  has_variant: boolean;
  inventory_tracking: ProductInventoryTracking;
  description?: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  opening_stock?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
}
