import api from '../lib/api';

export const tenantBillingApi = {
  myInvoices: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const { data } = await api.get('/tenant-billing/myInvoices', { params });
    return data;
  },

  myInvoiceById: async (id: string) => {
    const { data } = await api.get(`/tenant-billing/myInvoiceById/${id}`);
    return data;
  },

  submitPayment: async (payload: {
    invoice_id: string;
    method?: string;
    transaction_ref?: string;
    notes?: string;
    proof_url: string;
    proof_file_key?: string;
  }) => {
    const { data } = await api.post('/tenant-billing/submitPayment', payload);
    return data;
  },

  myPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const { data } = await api.get('/tenant-billing/myPayments', { params });
    return data;
  },

  openSummary: async () => {
    const { data } = await api.get('/tenant-billing/openSummary');
    return data;
  },
};
