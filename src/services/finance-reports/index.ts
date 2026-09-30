import api from '../lib/api';
import { FinanceReportParams } from '@/types/finance.types';

function assertRange(params?: FinanceReportParams) {
  if (!params?.date_from || !params?.date_to) {
    throw new Error('date_from and date_to are required');
  }
  return {
    date_from: params.date_from,
    date_to: params.date_to,
  };
}

export const financeReportsApi = {
  getAll: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/getAll', {
      params: assertRange(params),
    });
    return data;
  },

  cogs: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/cogs', {
      params: assertRange(params),
    });
    return data;
  },

  profitLoss: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/profitLoss', {
      params: assertRange(params),
    });
    return data;
  },

  cashFlow: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/cashFlow', {
      params: assertRange(params),
    });
    return data;
  },

  taxSummary: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/taxSummary', {
      params: assertRange(params),
    });
    return data;
  },

  registerSummary: async (params?: FinanceReportParams) => {
    const { data } = await api.get('/finance-reports/registerSummary', {
      params: assertRange(params),
    });
    return data;
  },
};
