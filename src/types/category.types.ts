export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
}

export interface CategoriesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: {
    data?: Category[];
    categories?: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CategoryDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Category;
}

export interface CategoriesByParentResponse {
  statusCode: number;
  status: boolean;
  message: string;
  heading: string;
  data: Category[];
}
