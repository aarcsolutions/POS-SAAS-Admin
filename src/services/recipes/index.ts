import api from '../lib/api';
import {
  RecipeDetail,
  RecipePayload,
  RecipeProductCard,
  RecipesListResponse,
} from '@/types/recipe.types';

type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export const recipesApi = {
  getAll: async (
    params: { page?: number; limit?: number; search?: string } = {}
  ) => {
    const { data } = await api.get<RecipesListResponse>('/recipes/getAll', {
      params,
    });
    return data;
  },

  getProductsWithoutRecipes: async () => {
    const { data } = await api.get<ApiEnvelope<RecipeProductCard[]>>(
      '/recipes/getProductsWithoutRecipes'
    );
    return data;
  },

  getByVariantId: async (variantId: string) => {
    const { data } = await api.get<ApiEnvelope<RecipeDetail>>(
      `/recipes/getByVariantId/${variantId}`
    );
    return data;
  },

  create: async (payload: RecipePayload) => {
    const { data } = await api.post('/recipes/create', payload);
    return data;
  },

  update: async (payload: RecipePayload) => {
    const { data } = await api.put('/recipes/update', payload);
    return data;
  },

  delete: async (variantId: string) => {
    const { data } = await api.delete('/recipes/delete', {
      data: { variant_id: variantId },
    });
    return data;
  },
};
