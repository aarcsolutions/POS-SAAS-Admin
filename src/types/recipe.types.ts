export interface RecipeIngredient {
  id?: string;
  raw_material_id: string;
  raw_material?: {
    id: string;
    name: string;
    unit: string;
    stock_quantity?: number;
    compatible_units?: string[];
  } | null;
  quantity_required?: number;
  input_quantity: number | null;
  input_unit: string | null;
  base_quantity?: number | null;
  base_unit?: string | null;
}

export interface RecipeDetail {
  variant_id: string;
  variant_name?: string;
  product_id: string;
  product_name?: string | null;
  ingredients: RecipeIngredient[];
}

export interface RecipeProductCard {
  id: string;
  name: string;
  has_variant: boolean;
  description?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
  variants_with_recipe?: Array<{ id: string; name: string; price: number }>;
  variants_without_recipe?: Array<{ id: string; name: string; price: number }>;
  recipe_variant_count?: number;
  pending_variant_count?: number;
}

export interface RecipesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: RecipeProductCard[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export type RecipeIngredientPayload = {
  raw_material_id: string;
  quantity: number;
  unit: string;
};

export type RecipePayload = {
  variant_id: string;
  ingredients: RecipeIngredientPayload[];
};
