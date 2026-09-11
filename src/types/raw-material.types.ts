export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RawMaterialsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: RawMaterial[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RawMaterialDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: RawMaterial;
}

export type RawMaterialPayload = {
  name: string;
  unit: string;
  stock_quantity?: number;
  min_stock_level?: number;
};
