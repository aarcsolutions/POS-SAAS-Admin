import api from '../lib/api';
import {
  CategoriesByParentResponse,
  CategoriesListResponse,
  CategoryDetailResponse,
  CategoryDeleteImpactResponse,
} from '@/types/category.types';

export type CategoryPayload = {
  name: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string | null;
};

export const categoriesApi = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      branch_id?: string;
    } = {}
  ) => {
    const { data } = await api.get<CategoriesListResponse>('/categories/getAll', {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<CategoryDetailResponse>(
      `/categories/getById/${id}`
    );
    return data;
  },

  getByParentId: async (parentId: string | null = null) => {
    const path =
      parentId && parentId !== 'root'
        ? `/categories/getByParentId/${parentId}`
        : '/categories/getByParentId/root';
    const { data } = await api.get<CategoriesByParentResponse>(path);
    return data;
  },

  create: async (payload: CategoryPayload) => {
    const { data } = await api.post('/categories/create', payload);
    return data;
  },

  update: async (id: string, payload: Partial<CategoryPayload>) => {
    const { data } = await api.put('/categories/update', { id, ...payload });
    return data;
  },

  delete: async (id: string, cascadeProducts = false) => {
    const { data } = await api.delete('/categories/delete', {
      data: { id, cascade_products: cascadeProducts },
    });
    return data;
  },

  getDeleteImpact: async (id: string) => {
    const { data } = await api.get<CategoryDeleteImpactResponse>(
      `/categories/deleteImpact/${id}`,
    );
    return data;
  },
};
