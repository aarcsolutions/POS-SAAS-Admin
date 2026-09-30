import { useQuery } from '@tanstack/react-query';
import { financeReportsApi } from '@/services/finance-reports';
import { FinanceReportParams } from '@/types/finance.types';

export const useFinanceDashboardQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-dashboard', params],
    queryFn: () => financeReportsApi.getAll(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCogsReportQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-cogs', params],
    queryFn: () => financeReportsApi.cogs(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useProfitLossQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-profit-loss', params],
    queryFn: () => financeReportsApi.profitLoss(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useCashFlowQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-cash-flow', params],
    queryFn: () => financeReportsApi.cashFlow(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useTaxSummaryQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-tax-summary', params],
    queryFn: () => financeReportsApi.taxSummary(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });

export const useRegisterSummaryQuery = (
  params: FinanceReportParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: ['finance-register-summary', params],
    queryFn: () => financeReportsApi.registerSummary(params),
    enabled,
    placeholderData: (previousData) => previousData,
  });
