export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface SupplierRow {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  branch_id?: string;
}

export interface SupplierRawMaterialRow {
  id: string;
  supplier_id: string;
  raw_material_id: string;
  raw_material_name?: string;
  raw_material_unit?: string;
  unit_price: number;
  min_order_qty?: number | null;
  lead_time_days?: number | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface AssignRawMaterialPayload {
  supplier_id: string;
  raw_material_id: string;
  unit_price: number;
  min_order_qty?: number;
  lead_time_days?: number;
  notes?: string;
}

export interface MatchedSupplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  matched_material_ids: string[];
  mappings: Array<{
    raw_material_id: string;
    unit_price: number;
    min_order_qty?: number | null;
  }>;
}

export interface MatchByMaterialsResponse {
  status: boolean;
  message?: string;
  data?: {
    full_match: MatchedSupplier[];
    partial_match: MatchedSupplier[];
  };
}

export interface PurchaseItemPayload {
  raw_material_id: string;
  quantity: number;
  price: number;
}

export interface CreatePurchasePayload {
  supplier_id: string;
  items: PurchaseItemPayload[];
}

export interface PurchaseItemRow {
  id: string;
  raw_material_id: string;
  raw_material_name?: string | null;
  raw_material_unit?: string | null;
  quantity: number;
  price: number;
  received_quantity?: number | null;
}

export interface PurchaseRow {
  id: string;
  supplier_id: string;
  supplier_name?: string | null;
  supplier_email?: string | null;
  po_number?: string | null;
  status: PurchaseStatus;
  total_amount: number;
  branch_id?: string | null;
  branch_name?: string | null;
  items: PurchaseItemRow[];
  ordered_at?: string | null;
  received_at?: string | null;
  email_status?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SuppliersListResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export interface SupplierDetailResponse {
  status: boolean;
  message?: string;
  data?: SupplierRow;
}

export interface PurchasesListResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export interface PurchaseDetailResponse {
  status: boolean;
  message?: string;
  data?: PurchaseRow;
}
