export type RestaurantTableStatus = 'available' | 'occupied' | 'reserved';

export interface RestaurantTableRow {
  id: string;
  name: string;
  code?: string | null;
  capacity?: number | null;
  status: RestaurantTableStatus;
  branch_id?: string | null;
  branch_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TablePayload {
  name: string;
  code?: string | null;
  capacity?: number | null;
  status?: RestaurantTableStatus;
  branch_id?: string;
  is_active?: boolean;
}

export interface TablesListResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export interface TableDetailResponse {
  status: boolean;
  message?: string;
  data?: RestaurantTableRow;
}
