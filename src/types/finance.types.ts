export type FinanceAccountType = 'cash' | 'bank' | 'wallet' | 'other';

export type FinanceReportPeriod =
  | '7d'
  | '30d'
  | '90d'
  | 'month'
  | 'year'
  | 'custom';

export interface FinanceAccountRow {
  id: string;
  branch_id: string;
  name: string;
  type: FinanceAccountType | string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  is_default_for_method?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceAccountPayload {
  name: string;
  type: FinanceAccountType;
  currency?: string;
  opening_balance?: number;
  is_default_for_method?: string | null;
  branch_id?: string;
}

export interface CashShiftRow {
  id: string;
  register_id: string;
  branch_id: string;
  opened_by?: string | null;
  closed_by?: string | null;
  opened_at: string;
  closed_at?: string | null;
  opening_cash: number;
  expected_cash?: number | null;
  actual_cash?: number | null;
  difference?: number | null;
  status: 'open' | 'closed' | string;
  is_active?: boolean;
}

export interface CashRegisterRow {
  id: string;
  branch_id: string;
  name: string;
  finance_account_id: string;
  is_active?: boolean;
  open_shift?: CashShiftRow | null;
  created_at?: string;
  updated_at?: string;
}

export interface CashRegisterPayload {
  name: string;
  finance_account_id: string;
  branch_id?: string;
}

export interface FinanceTransactionRow {
  id: string;
  branch_id: string;
  account_id: string;
  direction: 'in' | 'out' | string;
  amount: number;
  transaction_type: string;
  occurred_at: string;
  description?: string | null;
  reference?: string | null;
  source_module?: string | null;
  source_id?: string | null;
  transfer_group_id?: string | null;
  cash_shift_id?: string | null;
  counterparty_account_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TransferPayload {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  branch_id?: string;
  description?: string;
}

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCategoryPayload {
  name: string;
  description?: string;
}

export interface ExpenseRow {
  id: string;
  branch_id: string;
  category_id: string;
  amount: number;
  expense_date: string;
  finance_account_id: string;
  description?: string | null;
  reference?: string | null;
  attachment_url?: string | null;
  status: string;
  finance_transaction_id?: string | null;
  cash_shift_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpensePayload {
  category_id: string;
  amount: number;
  expense_date: string;
  finance_account_id: string;
  description?: string;
  reference?: string;
  attachment_url?: string;
  cash_shift_id?: string;
  branch_id?: string;
}

export interface FinanceReportParams {
  date_from: string;
  date_to: string;
}

export interface FinanceDashboardKpis {
  gross_sales?: number;
  discounts?: number;
  delivery_fees?: number;
  net_sales?: number;
  estimated_cogs?: number;
  gross_profit?: number;
  expenses?: number;
  estimated_net_profit?: number;
  tax_collected?: number;
  cash_in?: number;
  cash_out?: number;
  net_cash_flow?: number;
  current_balances?: {
    total_balance?: number;
    cash_balance?: number;
    bank_balance?: number;
    wallet_balance?: number;
  };
  [key: string]: unknown;
}

export interface FinanceReportEnvelope {
  period?: string;
  period_label?: string;
  includes_archived_branches?: boolean;
  kpis?: FinanceDashboardKpis;
  estimated_cogs?: number;
  net_sales?: number;
  gross_profit?: number;
  gross_sales?: number;
  discounts?: number;
  delivery_fees?: number;
  expenses?: number;
  estimated_net_profit?: number;
  tax_collected?: number;
  cash_in?: number;
  cash_out?: number;
  net_cash_flow?: number;
  note?: string;
  [key: string]: unknown;
}

export interface SupplierPayableRow {
  id: string;
  branch_id: string | null;
  purchase_id: string;
  supplier_id: string;
  payable_date: string;
  original_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  notes?: string | null;
  is_active?: boolean;
  payments?: SupplierPaymentRow[];
  created_at?: string;
  updated_at?: string;
}

export interface SupplierPaymentRow {
  id: string;
  branch_id: string | null;
  payable_id: string;
  supplier_id: string;
  finance_account_id: string;
  finance_transaction_id?: string | null;
  amount: number;
  paid_at: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PayPayablePayload {
  payable_id: string;
  finance_account_id: string;
  amount: number;
  reference?: string;
  notes?: string;
  paid_at?: string;
}

export interface CustomerReceivableRow {
  id: string;
  branch_id: string | null;
  order_id: string;
  customer_id: string;
  original_amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  opened_at: string;
  notes?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankStatementLineRow {
  id: string;
  statement_id: string;
  line_date: string;
  amount: number;
  description?: string | null;
  status: string;
  matched_finance_transaction_id?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankStatementRow {
  id: string;
  branch_id: string | null;
  finance_account_id: string;
  period_start: string;
  period_end: string;
  status: string;
  source_label?: string | null;
  reconciled_at?: string | null;
  reconciled_by?: string | null;
  lines?: BankStatementLineRow[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BankStatementLinePayload {
  line_date: string;
  amount: number;
  description?: string;
}

export interface CreateBankStatementPayload {
  finance_account_id: string;
  period_start: string;
  period_end: string;
  source_label?: string;
  branch_id?: string;
  lines: BankStatementLinePayload[];
}

export interface FinancePeriodRow {
  id: string;
  branch_id: string | null;
  period_start: string;
  period_end: string;
  status: string;
  closed_at?: string | null;
  closed_by?: string | null;
  notes?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFinancePeriodPayload {
  period_start: string;
  period_end: string;
  notes?: string;
  branch_id?: string;
}
