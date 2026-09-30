export type InventoryBalanceItemType =
  | 'raw_material'
  | 'product_variant'
  | 'inventory_item';

export type InventoryStockStatus =
  | 'optimal'
  | 'low'
  | 'critical'
  | 'out';

export type InventoryBalance = {
  item_type: InventoryBalanceItemType;
  id: string;
  name: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  status: InventoryStockStatus;
  branch_id?: string | null;
  updated_at?: string;
};

export type StockMovementRow = {
  id: string;
  item_type: string;
  item_id: string;
  item_name: string;
  movement_type: string;
  reference_type?: string | null;
  reference_id?: string | null;
  qty: number;
  balance_after?: number | null;
  notes?: string | null;
  created_at: string;
};

export type InventoryBalancesResponse = {
  status: boolean;
  message?: string;
  data?: {
    data?: InventoryBalance[];
    items?: InventoryBalance[];
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
    total?: number;
    page?: number;
    limit?: number;
  };
};

export type StockMovementsResponse = {
  status: boolean;
  message?: string;
  data?: {
    data?: StockMovementRow[];
    items?: StockMovementRow[];
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
    total?: number;
    page?: number;
    limit?: number;
  };
};
