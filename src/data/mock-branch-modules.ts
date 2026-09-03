import type { BranchModuleOption } from '@/types/branch.types';

/**
 * Mock modules/permissions representing the Tenant Admin's licensed ceiling.
 * Later replaced by API: permissions on the tenant `admin` role.
 */
export const MOCK_TENANT_LICENSED_MODULES: BranchModuleOption[] = [
  {
    id: 'mod-orders',
    title: 'Orders',
    slug: 'orders',
    permissions: [
      { id: 'perm-orders-view', title: 'View Orders', slug: 'orders.view', is_allowed: false },
      { id: 'perm-orders-create', title: 'Create Orders', slug: 'orders.create', is_allowed: false },
      { id: 'perm-orders-edit', title: 'Edit Orders', slug: 'orders.edit', is_allowed: false },
      { id: 'perm-orders-delete', title: 'Delete Orders', slug: 'orders.delete', is_allowed: false },
    ],
  },
  {
    id: 'mod-products',
    title: 'Products',
    slug: 'products',
    permissions: [
      { id: 'perm-products-view', title: 'View Products', slug: 'products.view', is_allowed: false },
      { id: 'perm-products-create', title: 'Create Products', slug: 'products.create', is_allowed: false },
      { id: 'perm-products-edit', title: 'Edit Products', slug: 'products.edit', is_allowed: false },
      { id: 'perm-products-delete', title: 'Delete Products', slug: 'products.delete', is_allowed: false },
    ],
  },
  {
    id: 'mod-inventory',
    title: 'Inventory',
    slug: 'inventory',
    permissions: [
      { id: 'perm-inventory-view', title: 'View Inventory', slug: 'inventory.view', is_allowed: false },
      { id: 'perm-inventory-create', title: 'Adjust Inventory', slug: 'inventory.create', is_allowed: false },
      { id: 'perm-inventory-edit', title: 'Edit Inventory', slug: 'inventory.edit', is_allowed: false },
    ],
  },
  {
    id: 'mod-tables',
    title: 'Tables',
    slug: 'tables',
    permissions: [
      { id: 'perm-tables-view', title: 'View Tables', slug: 'tables.view', is_allowed: false },
      { id: 'perm-tables-create', title: 'Create Tables', slug: 'tables.create', is_allowed: false },
      { id: 'perm-tables-edit', title: 'Edit Tables', slug: 'tables.edit', is_allowed: false },
    ],
  },
  {
    id: 'mod-customers',
    title: 'Customers',
    slug: 'customers',
    permissions: [
      { id: 'perm-customers-view', title: 'View Customers', slug: 'customers.view', is_allowed: false },
      { id: 'perm-customers-create', title: 'Create Customers', slug: 'customers.create', is_allowed: false },
      { id: 'perm-customers-edit', title: 'Edit Customers', slug: 'customers.edit', is_allowed: false },
    ],
  },
  {
    id: 'mod-reports',
    title: 'Reports',
    slug: 'reports',
    permissions: [
      { id: 'perm-reports-view', title: 'View Reports', slug: 'reports.view', is_allowed: false },
      { id: 'perm-reports-export', title: 'Export Reports', slug: 'reports.export', is_allowed: false },
    ],
  },
  {
    id: 'mod-users',
    title: 'Users',
    slug: 'users',
    permissions: [
      { id: 'perm-users-view', title: 'View Users', slug: 'users.view', is_allowed: false },
      { id: 'perm-users-create', title: 'Create Users', slug: 'users.create', is_allowed: false },
      { id: 'perm-users-edit', title: 'Edit Users', slug: 'users.edit', is_allowed: false },
    ],
  },
];

/** Mock licensed branch cap from Platform Admin (later: tenants.licensed_branches). */
export const MOCK_LICENSED_BRANCHES = 2;
