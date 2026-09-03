export interface Driver {
  id: string;
  name: string;
  phone: string;
  branch_id: string;
  branch_name?: string;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriversListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Driver[];
    drivers?: Driver[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DriverDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Driver;
}

export type DriverPayload = {
  name: string;
  phone: string;
  branch_id?: string;
  notes?: string | null;
  is_active?: boolean;
};
