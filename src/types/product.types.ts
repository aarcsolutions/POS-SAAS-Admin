export interface Variant {
  id: string;
  type: 'size' | 'color' | 'weight' | 'other';
  value: string;
  additionalPrice: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive';
  variants: Variant[];
  hasImage: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string;
  productCount: number;
}
