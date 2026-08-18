export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomersListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Customer[];
    customers?: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CustomerDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Customer;
}

export type CustomerPayload = {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  is_active?: boolean;
};
