export interface BusinessSettingsRow {
  id: string;
  business_name: string;
  logo_url?: string | null;
  currency: string;
  language: string;
  tax_registration_number?: string | null;
  default_tax_id?: string | null;
  default_tax_name?: string | null;
  default_tax_type?: string | null;
  default_tax_value?: number | null;
  prices_include_tax: boolean;
  branch_id?: string | null;
  branch_name?: string | null;
  updated_at?: string;
}

export interface BusinessSettingsPayload {
  id?: string;
  business_name: string;
  logo_url?: string | null;
  currency?: string;
  language?: string;
  tax_registration_number?: string | null;
  default_tax_id?: string | null;
  prices_include_tax?: boolean;
  branch_id?: string | null;
}
