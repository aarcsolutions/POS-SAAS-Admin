import api from '../lib/api';
import {
  ProductDetailResponse,
  ProductPayload,
  ProductsListResponse,
} from '@/types/product.types';

export type ProductsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
};

export const productsApi = {
  getAll: async (params: ProductsQueryParams = {}) => {
    const { data } = await api.get<ProductsListResponse>('/products/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ProductDetailResponse>(
      `/products/getById/${id}`
    );
    return data;
  },

  create: async (payload: ProductPayload) => {
    const { data } = await api.post('/products/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<ProductPayload>) => {
    const { data } = await api.put('/products/update', { id, ...payload });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete('/products/delete', { data: { id } });
    return data;
  },
};
