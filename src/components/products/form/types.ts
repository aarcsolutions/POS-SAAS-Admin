export type PublishingStatus = 'draft' | 'published' | 'archived';

export interface BulkTier {
  id: string;
  quantity: number;
  price: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  values: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  supplier: string;
  mainCategory: string;
  subCategory: string;
  productType: string;
  variants: ProductVariant[];
  visibilityRetail: boolean;
  visibilityWholesale: boolean;
  productActive: boolean;
  sellingPrice: number;
  costPrice: number;
  taxVat: string;
  profitMargin: number;
  discountPercentage: number;
  discountStartDate: string;
  discountEndDate: string;
  bulkPricing: BulkTier[];
  galleryImages: string[];
  urlImages: string[];
  videos: string[];
  videoUrls: string[];
  trackInventory: boolean;
  stockQuantity: number;
  weight: number;
  width: number;
  length: number;
  height: number;
  urlSlug: string;
  seoTitle: string;
  metaDescription: string;
  publishingStatus: PublishingStatus;
}
