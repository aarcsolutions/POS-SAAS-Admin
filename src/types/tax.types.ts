export interface TaxRow {
  id: string;
  name: string;
  type: 'percentage' | 'flat' | string;
  value: number;
  branch_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaxPayload {
  name: string;
  type: 'percentage' | 'flat';
  value: number;
}

export interface TaxesListResponse {
  status: boolean;
  message?: string;
  data?: any;
}
