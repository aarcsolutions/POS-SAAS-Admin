export interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id?: string;
  name: string;
  price: number;
  cost_price: number;
  images?: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category?: { id: string; name: string } | null;
  description?: string | null;
  has_variant: boolean;
  is_active: boolean;
  price?: number;
  cost_price?: number;
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
  description?: string;
  price?: number;
  cost_price?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
}
