import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipesApi } from '@/services/recipes';
import { RecipePayload } from '@/types/recipe.types';
import { toast } from 'sonner';

export const useRecipesWithProductsQuery = (
  params: { page?: number; limit?: number; search?: string } = {}
) =>
  useQuery({
    queryKey: ['recipes', 'with', params],
    queryFn: () => recipesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });

export const useRecipesWithoutProductsQuery = (enabled = true) =>
  useQuery({
    queryKey: ['recipes', 'without'],
    queryFn: () => recipesApi.getProductsWithoutRecipes(),
    enabled,
  });

export const useRecipeByVariantQuery = (variantId: string | null) =>
  useQuery({
    queryKey: ['recipes', 'variant', variantId],
    queryFn: () => recipesApi.getByVariantId(variantId!),
    enabled: !!variantId,
  });

export const useCreateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecipePayload) => recipesApi.create(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Recipe created');
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create recipe');
    },
  });
};

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecipePayload) => recipesApi.update(payload),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Recipe updated');
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update recipe');
    },
  });
};

export const useDeleteRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => recipesApi.delete(variantId),
    onSuccess: (response) => {
      if (response.status) {
        toast.success(response.message || 'Recipe deleted');
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete recipe');
    },
  });
};
