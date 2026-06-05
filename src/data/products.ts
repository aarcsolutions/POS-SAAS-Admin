import { Product, ProductCategory } from '@/types/product.types';

export const initialCategories: ProductCategory[] = [
  { id: '1', name: 'Beverages', color: '#10b981', productCount: 24 },
  { id: '2', name: 'Food Items', color: '#f59e0b', productCount: 45 },
  { id: '3', name: 'Desserts', color: '#ec4899', productCount: 18 },
  { id: '4', name: 'Snacks', color: '#8b5cf6', productCount: 32 },
  { id: '5', name: 'Raw Materials', color: '#6366f1', productCount: 56 },
];

export const initialProducts: Product[] = [
  {
    id: '1', name: 'Chicken Burger', sku: 'PRD-001', barcode: '8901234567890', category: 'Food Items',
    description: 'Premium chicken patty with fresh lettuce, tomato, and special sauce',
    costPrice: 180, salePrice: 320, stock: 45, minStock: 20, status: 'active', hasImage: true,
    variants: [
      { id: 'v1', type: 'size', value: 'Regular', additionalPrice: 0, stock: 30, sku: 'PRD-001-R' },
      { id: 'v2', type: 'size', value: 'Large', additionalPrice: 80, stock: 15, sku: 'PRD-001-L' },
      { id: 'v3', type: 'other', value: 'Double Patty', additionalPrice: 150, stock: 8, sku: 'PRD-001-D' },
    ],
  },
  {
    id: '2', name: 'Latte Coffee', sku: 'PRD-002', barcode: '8901234567891', category: 'Beverages',
    description: 'Rich espresso with steamed milk and light foam',
    costPrice: 80, salePrice: 200, stock: 120, minStock: 30, status: 'active', hasImage: true,
    variants: [
      { id: 'v4', type: 'size', value: 'Small', additionalPrice: 0, stock: 40, sku: 'PRD-002-S' },
      { id: 'v5', type: 'size', value: 'Medium', additionalPrice: 40, stock: 50, sku: 'PRD-002-M' },
      { id: 'v6', type: 'size', value: 'Large', additionalPrice: 80, stock: 30, sku: 'PRD-002-L' },
    ],
  },
  {
    id: '3', name: 'Chocolate Cake Slice', sku: 'PRD-003', barcode: '8901234567892', category: 'Desserts',
    description: 'Rich chocolate layer cake with ganache frosting',
    costPrice: 120, salePrice: 250, stock: 12, minStock: 15, status: 'active', hasImage: true,
    variants: [
      { id: 'v7', type: 'size', value: 'Slice', additionalPrice: 0, stock: 12, sku: 'PRD-003-S' },
      { id: 'v8', type: 'other', value: 'Whole Cake', additionalPrice: 1500, stock: 3, sku: 'PRD-003-W' },
    ],
  },
  {
    id: '4', name: 'French Fries', sku: 'PRD-004', barcode: '8901234567893', category: 'Snacks',
    description: 'Crispy golden fries with sea salt',
    costPrice: 60, salePrice: 150, stock: 80, minStock: 25, status: 'active', hasImage: false,
    variants: [
      { id: 'v9', type: 'size', value: 'Small', additionalPrice: 0, stock: 40, sku: 'PRD-004-S' },
      { id: 'v10', type: 'size', value: 'Large', additionalPrice: 50, stock: 40, sku: 'PRD-004-L' },
    ],
  },
  {
    id: '5', name: 'Arabica Coffee Beans', sku: 'PRD-005', barcode: '8901234567894', category: 'Raw Materials',
    description: 'Premium Arabica beans, 1kg pack',
    costPrice: 800, salePrice: 1200, stock: 8, minStock: 10, status: 'active', hasImage: true,
    variants: [
      { id: 'v11', type: 'weight', value: '500g', additionalPrice: 0, stock: 5, sku: 'PRD-005-500' },
      { id: 'v12', type: 'weight', value: '1kg', additionalPrice: 500, stock: 3, sku: 'PRD-005-1K' },
    ],
  },
  {
    id: '6', name: 'Vanilla Milkshake', sku: 'PRD-006', barcode: '8901234567895', category: 'Beverages',
    description: 'Creamy vanilla milkshake with whipped cream',
    costPrice: 90, salePrice: 220, stock: 0, minStock: 15, status: 'inactive', hasImage: false,
    variants: [],
  },
  {
    id: '7', name: 'Chicken Shawarma Wrap', sku: 'PRD-007', barcode: '8901234567896', category: 'Food Items',
    description: 'Grilled chicken with garlic sauce and pickles in flatbread',
    costPrice: 150, salePrice: 280, stock: 35, minStock: 20, status: 'active', hasImage: true,
    variants: [
      { id: 'v13', type: 'size', value: 'Regular', additionalPrice: 0, stock: 20, sku: 'PRD-007-R' },
      { id: 'v14', type: 'size', value: 'Large', additionalPrice: 60, stock: 15, sku: 'PRD-007-L' },
    ],
  },
];
