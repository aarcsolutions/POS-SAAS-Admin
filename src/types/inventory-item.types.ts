export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  branch_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: InventoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface InventoryItemDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: InventoryItem;
}

export type InventoryItemPayload = {
  name: string;
  unit: string;
  stock_quantity?: number;
  min_stock_level?: number;
};
